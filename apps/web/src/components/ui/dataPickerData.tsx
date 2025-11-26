import { CalculatorIcon } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { Button } from "./button";

export const DatePickerData = ({value, onChange} : {value: Date | undefined, onChange: (date: Date | undefined) => void}) => {
  
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="flex-1 ">
        <Button variant={"outline"} className="w-full justify-start relative">
          {value ? new Date(value).toLocaleDateString() : "Selecione uma data"}
          <CalculatorIcon className="w-4 h-4 absolute right-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value}
          onSelect={(date) => {           
            setOpen(false);
            onChange(date);
          }}
        ></Calendar>
      </PopoverContent>
    </Popover>
  );
};
