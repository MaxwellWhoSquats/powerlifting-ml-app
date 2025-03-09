interface BodyweightSelectProps {
  bodyweight: string;
  sex: "0" | "1" | "";
  weightClasses: { [key in "0" | "1"]: string[] };
  onBodyweightChange: (value: string) => void;
}

const BodyweightSelect = ({
  bodyweight,
  sex,
  weightClasses,
  onBodyweightChange,
}: BodyweightSelectProps) => (
  <div className="mb-4">
    <label className="block text-teal-200 mb-2">Bodyweight (kg):</label>
    <select
      className="w-full p-2 bg-teal-700 text-gray-100 rounded"
      value={bodyweight}
      onChange={(e) => onBodyweightChange(e.target.value)}
      required
      disabled={!sex}
    >
      <option value="" disabled className="text-gray-400">
        Select a bodyweight
      </option>
      {sex !== "" &&
        weightClasses[sex].map((weight) => (
          <option key={weight} value={weight} className="text-gray-100">
            {weight} kg
          </option>
        ))}
    </select>
  </div>
);

export default BodyweightSelect;
