import { fromPartial } from '@total-typescript/shoehorn';
import type { InvalidArgumentError, ProblemDetailsError } from '../../src/api-contract';
import { ErrorType } from '../../src/api-contract';
import type { ShlinkApiErrorProps } from '../../src/common/ShlinkApiError';
import { ShlinkApiError } from '../../src/common/ShlinkApiError';
import { checkAccessibility } from '../__helpers__/accessibility';
import { render } from '../__helpers__/setUpTest';

describe('<ShlinkApiError />', () => {
  const setUp = (props: ShlinkApiErrorProps) => render(<ShlinkApiError {...props} />);

  it('passes a11y checks', () => checkAccessibility(setUp({})));

  it.each([
    [undefined, 'the fallback', 'the fallback'],
    [fromPartial<ProblemDetailsError>({}), 'the fallback', 'the fallback'],
    [fromPartial<ProblemDetailsError>({ detail: 'the detail' }), 'the fallback', 'the detail'],
  ])('renders proper message', async (errorData, fallbackMessage, expectedMessage) => {
    const { container, ...screen } = await setUp({ errorData, fallbackMessage });

    expect(container.firstChild).toHaveTextContent(expectedMessage);
    await expect.element(screen.getByRole('paragraph')).not.toBeInTheDocument();
  });

  it.each([
    [undefined, 0],
    [fromPartial<ProblemDetailsError>({}), 0],
    [fromPartial<InvalidArgumentError>({ type: ErrorType.INVALID_ARGUMENT, invalidElements: [] }), 1],
  ])(
    'renders list of invalid elements when provided error is an InvalidError',
    async (errorData, expectedElementsCount) => {
      const screen = await setUp({ errorData });
      expect(screen.getByText(/^Invalid elements/).all()).toHaveLength(expectedElementsCount);
    },
  );
});
