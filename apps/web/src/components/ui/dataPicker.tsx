import { useEffect, useState } from "react";
import { DatePickerData } from "./dataPickerData"
import { DatePickerTime } from "./dataPickerTime"

export const DatePickerWithTime = ({value, onChange} : {value?: Date | undefined, onChange?: (date: Date | undefined) => void}) => {
    
    const [internalDate, setInternalDate] = useState<Date | undefined>(value);
    const [internalTime, setInternalTime] = useState<Date | undefined>(value);

    useEffect(() => {
        if(!internalDate) {
            setInternalTime(undefined);
            return;
        }

        const newValue = new Date(internalDate.getTime());
        newValue.setHours(internalTime?.getHours() || 0, internalTime?.getMinutes() || 0, 0, 0);

        if(value?.getTime() !== newValue.getTime()) {
            onChange?.(newValue);
            console.log("newValue", newValue);
        }

    }, [internalDate, internalTime])

    useEffect(() => {
        if(!value) {
            setInternalDate(undefined);
            setInternalTime(undefined);
            return;
        }

        const onlyDate = new Date(value);
        onlyDate.setHours(0, 0, 0, 0);

        const onlyTime = new Date(value);

        setInternalDate(onlyDate);
        setInternalTime(onlyTime);

    }, [value])

    return <div className="DatePickerWithTime flex gap-2 w-full">
        <DatePickerData value={internalDate} onChange={setInternalDate} />
        <DatePickerTime value={internalTime} onChange={setInternalTime} />
    </div>
}