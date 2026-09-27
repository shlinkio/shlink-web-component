import { TagsSearchDropdown } from '../../../src/tags/helpers/TagsSearchDropdown';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { colorGeneratorMock } from '../../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagsSearchDropdown />', () => {
  const onTagsChange = vi.fn();
  const onModeChange = vi.fn();
  const setUp = (selectedTags = ['foo', 'bar']) =>
    renderWithEvents(
      <TagsSearchDropdown
        title="Tags"
        prefix="Including"
        tags={['foo', 'bar', 'baz']}
        selectedTags={selectedTags}
        onTagsChange={onTagsChange}
        onModeChange={onModeChange}
        ColorGenerator={colorGeneratorMock}
      />,
    );
  const setUpOpened = async (selectedTags?: string[]) => {
    const { user, ...screen } = await setUp(selectedTags);
    await user.click(screen.getByRole('button'));

    return { user, ...screen };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    { selectedTags: [], expectedContent: 'Including tags...' },
    { selectedTags: ['foo'], expectedContent: 'Including 1 tag' },
    { selectedTags: ['foo', 'bar'], expectedContent: 'Including 2 tags' },
    { selectedTags: ['foo', 'bar', 'baz'], expectedContent: 'Including 3 tags' },
  ])('displays expected button content based on selected tags', async ({ selectedTags, expectedContent }) => {
    const screen = await setUp(selectedTags);
    await expect.element(screen.getByRole('button')).toHaveTextContent(expectedContent);
  });

  it.each([
    { selectedTags: [] },
    { selectedTags: ['foo'] },
    { selectedTags: ['foo', 'bar'] },
    { selectedTags: ['foo', 'bar', 'baz'] },
  ])('renders list of selected tags', async ({ selectedTags }) => {
    const screen = await setUpOpened(selectedTags);

    if (selectedTags.length === 0) {
      await expect.element(screen.getByRole('list')).not.toBeInTheDocument();
    } else {
      await expect.element(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByRole('listitem').all()).toHaveLength(selectedTags.length);
    }
  });

  it('can remove individual selected tags by closing them', async () => {
    const { user, ...screen } = await setUpOpened();

    await user.click(screen.getByLabelText('Remove foo'));
    expect(onTagsChange).toHaveBeenLastCalledWith(['bar']);
    await user.click(screen.getByLabelText('Remove bar'));
    expect(onTagsChange).toHaveBeenLastCalledWith(['foo']);
  });

  it('can remove all selected tags at once via clear button', async () => {
    const { user, ...screen } = await setUpOpened();

    await user.click(screen.getByRole('button', { name: 'Clear tags' }));
    expect(onTagsChange).toHaveBeenLastCalledWith([]);
  });

  it('dispatches `Escape` keydown when tags are cleared', async () => {
    const { user, container, ...screen } = await setUpOpened();
    const listener = vi.fn();

    container.addEventListener('keydown', listener);

    await user.click(screen.getByRole('button', { name: 'Clear tags' }));
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
  });

  it.each(['bar', 'baz'])('can add new tags by selecting from search results', async (selectedOption) => {
    const { user, ...screen } = await setUpOpened([]);

    await user.type(screen.getByPlaceholder('Search...'), 'ba');
    // Search results are displayed with a delay. Wait for them
    await screen.getByRole('listbox').findElement();

    await user.click(screen.getByRole('option', { name: selectedOption }));

    expect(onTagsChange).toHaveBeenCalledWith([selectedOption]);
  });

  it.each(['ba', 'noresults'])(
    'stops keydown propagation when `Escape` is pressed in search while results are displayed',
    async (searchTerm) => {
      const { user, container, ...screen } = await setUpOpened([]);

      await user.type(screen.getByPlaceholder('Search...'), searchTerm);
      // Search results are displayed with a delay. Wait for them
      await screen.getByRole('listbox').findElement();

      const listener = vi.fn();
      container.addEventListener('keydown', listener);
      await user.keyboard('{Escape}');

      expect(listener).not.toHaveBeenCalled();
    },
  );

  it('does not stop keydown propagation when `Escape` is pressed in search if no results are displayed', async () => {
    const { user, container, ...screen } = await setUpOpened([]);

    const listener = vi.fn();
    container.addEventListener('keydown', listener);

    screen.getByPlaceholder('Search...').element().focus();
    await user.keyboard('{Escape}');

    expect(listener).toHaveBeenCalled();
  });

  it.each([
    { button: 'All', expectedMode: 'all' },
    { button: 'Any', expectedMode: 'any' },
  ])('chan change the tags mode', async ({ button, expectedMode }) => {
    const { user, ...screen } = await setUpOpened();

    await user.click(screen.getByRole('button', { name: button }));

    expect(onModeChange).toHaveBeenCalledWith(expectedMode);
  });
});
