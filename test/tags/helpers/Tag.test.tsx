import { MAIN_COLOR } from '@shlinkio/shlink-frontend-kit';
import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ReactNode } from 'react';
import { Tag } from '../../../src/tags/helpers/Tag';
import type { ColorGenerator } from '../../../src/utils/services/ColorGenerator';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error((`Could not convert color ${hex} to RGB`));
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

describe('<Tag />', () => {
  const onClick = vi.fn();
  const onClose = vi.fn();
  const isColorLightForKey = vi.fn(() => false);
  const getColorForKey = vi.fn(() => MAIN_COLOR);
  const colorGenerator = fromPartial<ColorGenerator>({ getColorForKey, isColorLightForKey });
  const setUp = (text: string, clearable?: boolean, children?: ReactNode) => {
    const props = !clearable ? { onClick } : { onClose };
    return renderWithEvents(
      <Tag text={text} colorGenerator={colorGenerator} {...props}>
        {children}
      </Tag>,
    );
  };

  it('passes a11y checks', () => checkAccessibility(setUp('the-tag')));

  it.each([
    [true],
    [false],
  ])('includes an extra class when the color is light', (isLight) => {
    isColorLightForKey.mockReturnValue(isLight);

    const { container } = setUp('foo');

    if (isLight) {
      expect(container.firstChild).toHaveClass('tag--light-bg');
    } else {
      expect(container.firstChild).not.toHaveClass('tag--light-bg');
    }
  });

  it.each([
    [MAIN_COLOR],
    ['#8A661C'],
    ['#F7BE05'],
    ['#5A02D8'],
    ['#202786'],
  ])('includes generated color as backgroundColor', (generatedColor) => {
    getColorForKey.mockReturnValue(generatedColor);

    const { container } = setUp('foo');
    const { r, g, b } = hexToRgb(generatedColor);

    expect(container.firstChild).toHaveAttribute(
      'style',
      expect.stringContaining(`background-color: rgb(${r}, ${g}, ${b})`),
    );
  });

  it.each([[true], [false]])('invokes expected callbacks when appropriate events are triggered', async (clearable) => {
    const { user } = setUp('foo', clearable);

    expect(onClick).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button'));

    if (clearable) {
      expect(onClick).not.toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    } else {
      expect(onClick).toHaveBeenCalledOnce();
      expect(onClose).not.toHaveBeenCalledOnce();
    }
  });

  it.each([
    [true, 1, false],
    [false, 0, true],
    [undefined, 0, true],
  ])('includes a close component when the tag is clearable', (clearable, expectedCloseBtnAmount, expectedPointer) => {
    const { container } = setUp('foo', clearable);

    expect(screen.queryAllByLabelText(/^Remove/)).toHaveLength(expectedCloseBtnAmount);
    if (expectedPointer) {
      expect(container.firstChild).toHaveClass('pointer');
    } else {
      expect(container.firstChild).not.toHaveClass('pointer');
    }
  });

  it.each([
    [undefined, 'foo'],
    ['bar', 'bar'],
  ])('falls back to text as children when no children are provided', (children, expectedChildren) => {
    const { container } = setUp('foo', false, children);
    expect(container.firstChild).toHaveTextContent(expectedChildren);
  });
});
