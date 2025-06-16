import { Dropdown } from '@shlinkio/shlink-frontend-kit';

interface PaginationDropdownProps {
  ranges: number[];
  value: number;
  setValue: (newValue: number) => void;
}

export const PaginationDropdown = ({ ranges, value, setValue }: PaginationDropdownProps) => (
  <Dropdown
    buttonContent="Paginate"
    buttonVariant="link"
    buttonClassName="[&]:p-0"
    buttonSize="sm"
    menuAlignment="right"
  >
    {ranges.map((itemsPerPage) => (
      <Dropdown.Item key={itemsPerPage} selected={itemsPerPage === value} onClick={() => setValue(itemsPerPage)}>
        <b>{itemsPerPage}</b> items per page
      </Dropdown.Item>
    ))}
    <Dropdown.Separator />
    <Dropdown.Item disabled={value === Infinity} onClick={() => setValue(Infinity)}>
      <i>Clear pagination</i>
    </Dropdown.Item>
  </Dropdown>
);
