import { useEffect, useState } from "react";
import { Input } from "./input";


export const DatePickerTime = ({value, onChange} : {value?: Date | undefined, onChange: (date: Date | undefined) => void}) => {


    const [rawValue, setRawValue] = useState("");

    useEffect(() => {
        if(!value) {
            setRawValue("");
            return;
        }

        const hh = String(value.getHours()).padStart(2, "0");
        const mm = String(value.getMinutes()).padStart(2, "0");

        setRawValue(`${hh}:${mm}`);
    }, [value])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        const v = e.target.value
        setRawValue(v);

        if(!v) {
            onChange(undefined);
            return;
        }

        const isValid = /^\d{2}:\d{2}$/.test(v);
        if(!isValid) {
            return;
        }

        const [h, m] = v.split(":").map(Number);
        const base = value ? new Date(value) : new Date();
        base.setHours(h!, m!, 0, 0);
        onChange(base);
    }

    return (
        <div className="DatePickerTime flex-1">
            <Input
            type="time"
            onChange={handleChange}
            value={rawValue}
            step="60"
            placeholder="HH:MM"
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            ></Input>
        </div>
    )
}