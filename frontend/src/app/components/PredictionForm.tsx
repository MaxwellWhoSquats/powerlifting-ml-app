import LoadingSpinner from "./LoadingSpinner";
import DivisionSelect from "./DivisionSelect";
import SexSelect from "./SexSelect";
import BodyweightSelect from "./BodyweightSelect";

interface PredictionFormProps {
  division: string;
  bodyweight: string;
  sex: "0" | "1" | "";
  divisions: string[];
  sexOptions: { label: string; value: "0" | "1" }[];
  weightClasses: { [key in "0" | "1"]: string[] };
  onDivisionChange: (value: string) => void;
  onSexChange: (value: "0" | "1" | "") => void;
  onBodyweightChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
}

const PredictionForm = ({
  division,
  bodyweight,
  sex,
  divisions,
  sexOptions,
  weightClasses,
  onDivisionChange,
  onSexChange,
  onBodyweightChange,
  onSubmit,
  loading,
  error,
}: PredictionFormProps) => (
  <form
    onSubmit={onSubmit}
    className="max-w-md mx-auto bg-teal-800 p-6 rounded-lg shadow-lg"
  >
    <DivisionSelect
      division={division}
      divisions={divisions}
      onDivisionChange={onDivisionChange}
    />
    <SexSelect
      sex={sex}
      sexOptions={sexOptions}
      onSexChange={onSexChange}
      onBodyweightChange={onBodyweightChange}
    />
    <BodyweightSelect
      bodyweight={bodyweight}
      sex={sex}
      weightClasses={weightClasses}
      onBodyweightChange={onBodyweightChange}
    />
    <button
      type="submit"
      className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-2 rounded transition duration-200"
      disabled={loading}
    >
      {loading ? <LoadingSpinner /> : "Predict"}
    </button>
    {error && <p className="text-red-300 text-center mt-4">{error}</p>}
  </form>
);

export default PredictionForm;
