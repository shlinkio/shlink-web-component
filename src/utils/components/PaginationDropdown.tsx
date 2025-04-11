import { useToggle } from '@shlinkio/shlink-frontend-kit';
import { Dropdown,DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

interface PaginationDropdownProps {
  ranges: number[];
  value: number;
  setValue: (newValue: number) => void;
  toggleClassName?: string;
}

export const PaginationDropdown = ({ toggleClassName, ranges, value, setValue }: PaginationDropdownProps) => {
  const [open, toggle] = useToggle();
  return (
    <Dropdown isOpen={open} toggle={toggle}>
      <DropdownToggle caret color="link" className={toggleClassName}>Paginate</DropdownToggle>
      <DropdownMenu end>
        {open && (
          <>
            {ranges.map((itemsPerPage) => (
              <DropdownItem key={itemsPerPage} active={itemsPerPage === value} onClick={() => setValue(itemsPerPage)}>
                <b>{itemsPerPage}</b> items per page
              </DropdownItem>
            ))}
            <DropdownItem divider tag="hr" />
            <DropdownItem disabled={value === Infinity} onClick={() => setValue(Infinity)}>
              <i>Clear pagination</i>
            </DropdownItem>
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};
