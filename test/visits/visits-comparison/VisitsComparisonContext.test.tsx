import { screen } from '@testing-library/react';
import { useVisitsComparison } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('useVisitsComparison', () => {
  const FakeComponent = () => {
    const { itemsToCompare, clearItemsToCompare, removeItemToCompare, addItemToCompare } = useVisitsComparison();

    return (
      <>
        <ul>
          {itemsToCompare.map((item, index) => (
            <li key={`${item.name}_${index}`}>{item.name} {item.query}</li>
          ))}
        </ul>
        <button
          type="button"
          data-testid="add-button"
          onClick={() => addItemToCompare({ name: `${Math.random()}`, query: `${Math.random()}` })}
        >
          Add
        </button>
        <button
          type="button"
          data-testid="remove-button"
          onClick={() => itemsToCompare[0] && removeItemToCompare(itemsToCompare[0])}
        >
          Remove first
        </button>
        <button type="button" data-testid="clear-button" onClick={clearItemsToCompare}>Clear</button>
      </>
    );
  };
  const setUp = () => renderWithEvents(<FakeComponent />);

  it('can handle items to compare', async () => {
    const { user } = setUp();

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    // Can add items
    await user.click(screen.getByTestId('add-button'));
    await user.click(screen.getByTestId('add-button'));
    await user.click(screen.getByTestId('add-button'));
    await user.click(screen.getByTestId('add-button'));
    await user.click(screen.getByTestId('add-button'));
    expect(screen.getAllByRole('listitem')).toHaveLength(5);

    // Can remove items
    await user.click(screen.getByTestId('remove-button'));
    await user.click(screen.getByTestId('remove-button'));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);

    // Can clear all items
    await user.click(screen.getByTestId('clear-button'));
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
