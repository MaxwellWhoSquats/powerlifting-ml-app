interface DivisionSelectProps {
  division: string;
  divisions: string[];
  onDivisionChange: (value: string) => void;
}

const DivisionSelect = ({
  division,
  divisions,
  onDivisionChange,
}: DivisionSelectProps) => (
  <div className="mb-4">
    <label className="block text-teal-200 mb-2">Division:</label>
    <select
      className="w-full p-2 bg-teal-700 text-gray-100 rounded"
      value={division}
      onChange={(e) => onDivisionChange(e.target.value)}
      required
    >
      <option value="" disabled className="text-gray-400">
        Select a division
      </option>
      {divisions.map((div) => (
        <option key={div} value={div} className="text-gray-100">
          {div}
        </option>
      ))}
    </select>
  </div>
);

export default DivisionSelect;
