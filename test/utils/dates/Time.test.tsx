import { parseDate } from '../../../src/utils/dates/helpers/date';
import type { TimeProps } from '../../../src/utils/dates/Time';
import { Time } from '../../../src/utils/dates/Time';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/setUpTest';

describe('<Time />', () => {
  const setUp = (props: Partial<TimeProps> = {}) => render(<Time date={new Date()} {...props} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [{ date: parseDate('2020-05-05', 'yyyy-MM-dd') }, '1588636800000', '2020-05-05 00:00'],
    [{ date: parseDate('2021-03-20', 'yyyy-MM-dd'), format: 'dd/MM/yyyy' }, '1616198400000', '20/03/2021'],
  ])('includes expected dateTime and format', async (props, expectedDateTime, expectedFormatted) => {
    const { container } = await setUp(props);

    await Promise.all([
      expect.element(container.firstChild as HTMLInputElement).toHaveAttribute('datetime', expectedDateTime),
      expect.element(container.firstChild as HTMLInputElement).toHaveTextContent(expectedFormatted),
    ]);
  });

  it('renders relative times when requested', async () => {
    const { container } = await setUp({ relative: true });
    await expect.element(container.firstChild as HTMLInputElement).toMatchTextContent(' ago');
  });
});
