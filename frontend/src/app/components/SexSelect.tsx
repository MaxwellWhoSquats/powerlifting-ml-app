interface SexSelectProps {
  sex: "0" | "1" | "";
  sexOptions: { label: string; value: "0" | "1" }[];
  onSexChange: (value: "0" | "1" | "") => void;
  onBodyweightChange: (value: string) => void;
}

const SexSelect = ({
  sex,
  sexOptions,
  onSexChange,
  onBodyweightChange,
}: SexSelectProps) => (
  <div className="mb-4">
    <label className="block text-teal-200 mb-2">Sex:</label>
    <select
      className="w-full p-2 bg-teal-700 text-gray-100 rounded"
      value={sex}
      onChange={(e) => {
        onSexChange(e.target.value as "0" | "1" | "");
        onBodyweightChange("");
      }}
      required
    >
      <option value="" disabled className="text-gray-400">
        Select sex
      </option>
      {sexOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-100"
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SexSelect;
