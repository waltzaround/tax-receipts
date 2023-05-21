import { useState, useCallback } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Content, Incomes2022, IncomesContent2022 } from '../data';
import './dropdown.css';

const Dropdown = ({ onChange }) => {
  const [incomeSelected, setIncomeSelected] = useState(null);

  const handleSelected = useCallback((selected) => {
    setIncomeSelected(selected);
    onChange(selected);
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="cta">
          {Content.selectIncome}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
          <DropdownMenu.Item className="DropdownMenuItem" onClick={() => handleSelected(Incomes2022.median)}>
            {IncomesContent2022["56160"]}
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem" onClick={() => handleSelected(Incomes2022.average)}>
            {IncomesContent2022["58836"]}
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem" onClick={() => handleSelected(Incomes2022.minimum)}>
            {IncomesContent2022["47216"]}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="DropdownMenuSeparator" />
          <DropdownMenu.Label className="DropdownMenuLabel">{Content.taxBands}</DropdownMenu.Label>
          <DropdownMenu.Item className="DropdownMenuItem" onClick={() => handleSelected(Incomes2022.band1)}>
            {IncomesContent2022["14000"]}
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem" onClick={() => handleSelected(Incomes2022.band2)}>
            {IncomesContent2022["48000"]}
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem" onClick={() => handleSelected(Incomes2022.band3)}>
            {IncomesContent2022["70000"]}
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem" onClick={() => handleSelected(Incomes2022.band4)}>
            {IncomesContent2022["180000"]}
          </DropdownMenu.Item>
          <DropdownMenu.Arrow className="DropdownMenuArrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export { Dropdown };