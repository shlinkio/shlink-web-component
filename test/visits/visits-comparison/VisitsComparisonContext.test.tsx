import { screen } from '@testing-library/react';
import { useState } from 'react';
import { useVisitsComparison } from '../../../src/visits/visits-comparison/VisitsComparisonContext';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('useVisitsComparison', () => {
  const FakeComponent = () => {
    const {
      itemsToCompare,
      clearItemsToCompare,
      removeItemToCompare,
      addItemToCompare,
      canAddItemWithName,
    } = useVisitsComparison();
    const [canAdd, setCanAdd] = useState(false);

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

        <button
          type="button"
          data-testid="can-add-duplicated-button"
          onClick={() => setCanAdd(canAddItemWithName(itemsToCompare[0].name))}
        >
          Can add duplicated
        </button>
        <button
          type="button"
          data-testid="can-add-new-button"
          onClick={() => setCanAdd(canAddItemWithName(`${Math.random()}`))}
        >
          Can add new
        </button>
        <span data-testid="can-add-items">{canAdd ? 'Yes' : 'No'}</span>
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

    // Adding more items is ignored once maximum is reached
    await user.click(screen.getByTestId('add-button'));
    await user.click(screen.getByTestId('add-button'));
    expect(screen.getAllByRole('listitem')).toHaveLength(5);

    // Can't add neither duplicated nor new items when maximum is reached
    await user.click(screen.getByTestId('can-add-new-button'));
    expect(screen.getByTestId('can-add-items')).toHaveTextContent('No');
    await user.click(screen.getByTestId('can-add-duplicated-button'));
    expect(screen.getByTestId('can-add-items')).toHaveTextContent('No');

    // Can remove items
    await user.click(screen.getByTestId('remove-button'));
    await user.click(screen.getByTestId('remove-button'));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);

    // Can add new items but not duplicated items when maximum is not reached
    await user.click(screen.getByTestId('can-add-new-button'));
    expect(screen.getByTestId('can-add-items')).toHaveTextContent('Yes');
    await user.click(screen.getByTestId('can-add-duplicated-button'));
    expect(screen.getByTestId('can-add-items')).toHaveTextContent('No');

    // Can clear all items
    await user.click(screen.getByTestId('clear-button'));
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
