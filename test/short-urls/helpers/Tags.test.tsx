import { Tags } from '../../../src/short-urls/helpers/Tags';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/setUpTest';
import { colorGeneratorMock } from '../../utils/services/__mocks__/ColorGenerator.mock';

describe('<Tags />', () => {
  const setUp = (tags: string[]) => render(<Tags tags={tags} colorGenerator={colorGeneratorMock} />);

  it.each([{ tags: [] }, { tags: ['foo', 'bar', 'baz'] }])('passes a11y checks', ({ tags }) =>
    checkAccessibility(setUp(tags)),
  );

  it('returns no tags when the list is empty', async () => {
    const screen = await setUp([]);
    await expect.element(screen.getByText('No tags')).toBeInTheDocument();
  });

  it.each([[['foo', 'bar', 'baz']], [['one', 'two', 'three', 'four', 'five']]])(
    'returns expected tags based on provided list',
    async (tags) => {
      const screen = await setUp(tags);

      await Promise.all([
        expect.element(screen.getByText('No tags')).not.toBeInTheDocument(),
        ...tags.map((tag) => expect.element(screen.getByText(tag)).toBeInTheDocument()),
      ]);
    },
  );
});
