import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import InputMask from "react-input-mask"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "dd/mm/aaaa" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (isValid(date)) {
        setInputValue(format(date, "dd/MM/yyyy"));
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Solo intentar parsear si tiene el formato completo (10 caracteres)
    if (newValue.length === 10) {
      const parsedDate = parse(newValue, "dd/MM/yyyy", new Date());
      
      if (isValid(parsedDate)) {
        onChange(format(parsedDate, "yyyy-MM-dd"));
      }
    } else if (newValue.replace(/\//g, "").length === 0) {
      // Si el campo está vacío (solo tiene barras)
      onChange("");
    }
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(format(selectedDate, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  const date = value ? new Date(value) : undefined;

  return (
    <div className="relative flex items-center">
      <InputMask
        mask="99/99/9999"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
      >
        {(inputProps: any) => (
          <Input
            {...inputProps}
            type="text"
            className="pr-10"
          />
        )}
      </InputMask>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute left-20 h-full px-7 py-2 hover:bg-transparent"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
          mode="single"
          selected={date}
          onSelect={handleCalendarSelect}
          locale={es}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={2020}
          toYear={2040}
          
            classNames={{
                caption: "flex justify-center pt-1 relative items-center",
                caption_dropdowns: "flex items-center gap-0",
                // Estas 3 claves dependen de react-day-picker v9:
                dropdown: "bg-transparent px-1 py-0 text-sm text-foreground",
                dropdown_month: "bg-transparent px-1 py-0 text-sm text-foreground",
                dropdown_year: "bg-transparent px-2 py-0 text-sm text-foreground",
            }}
        />
        </PopoverContent>
      </Popover>
    </div>
  )
}