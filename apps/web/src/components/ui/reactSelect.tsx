import type { GroupBase, OptionsOrGroups } from "react-select";
import ReactSelectLib from "react-select";

export const ReactSelect = ({
  isMulti,
  isLoading,
  isDisabled,
  isError,
  options,
  value,
  onChange,
  placeholder,
}: {
  isMulti?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  options: OptionsOrGroups<
    { value: number; label: string },
    GroupBase<{ value: number; label: string }>
  >;
  placeholder?: string;
  value: any;
  onChange: any;
}) => {
  return (
    <ReactSelectLib
      placeholder={placeholder}
      styles={{
        clearIndicator: (base) => ({
            ...base,
            paddingRight: "0px",
            marginRight: "-4px",
        }),        
        control: (base) => ({
          ...base,
          fontSize: "0.9rem",          
          backgroundColor: "color-mix(in oklab, var(--input) 30%, transparent)",
          borderRadius: "calc(var(--radius) - 2px)",
          borderColor: "var(--input)",
          "*": {
            color: "var(--foreground)",
            opacity: "0.75"
          }
        }),
        indicatorSeparator: () => ({
          display: "none",
        }),
        indicatorsContainer: (base) => ({
          ...base,
          opacity: "0.35",
          paddingRight: "0px",
          paddingLeft: "0px",
          ">*": {
            scale: "0.8",
          },
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "calc(var(--radius) - 2px)",
          backgroundColor: "var(--background)",
          opacity: "1",
          border: "1px solid var(--input)",
          padding: "0rem 0.3rem",
        }),
        option: (base) => ({
          ...base,
          margin: "0.3rem 0",
          backgroundColor: "var(--background)",
          borderRadius: "calc(var(--radius) - 2px)",
          padding: "0.2rem 0.7rem",
          ":hover": {
            backgroundColor: "var(--secondary)",
          },
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "var(--secondary)",
          borderRadius: "calc(var(--radius) - 4px)",
          ">*": {
            color: "var(--foreground)",
            opacity: "0.7",
          },
          ">*:first-of-type": {
            color: "var(--foreground)",
            marginBottom: "0.1rem",
          },
        }),
      }}
      isMulti={isMulti}
      isLoading={isLoading}
      isDisabled={isLoading || isError || isDisabled}
      options={options}
      value={value}
      onChange={onChange}
    />
  );
};
