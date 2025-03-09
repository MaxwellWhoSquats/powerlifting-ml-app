import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface RecommendationData {
  "1st Attempt": number;
  "2nd Attempt": number;
  "3rd Attempt": number;
}

type Lift = "Squat" | "Bench" | "Deadlift";

const RecommendationCard = ({
  lift,
  data,
}: {
  lift: Lift;
  data: RecommendationData;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-teal-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <h3 className="text-xl text-teal-200 mb-2 text-center font-bold">
        {lift}
      </h3>
      <ul className="list-none p-0 text-gray-100">
        <li className="mb-1">
          <span className="font-bold text-teal-300">1st Attempt:</span>{" "}
          <span className="text-lg">{data["1st Attempt"]} kg</span>
        </li>
        <li className="mb-1">
          <span className="font-bold text-teal-300">2nd Attempt:</span>{" "}
          <span className="text-lg">{data["2nd Attempt"]} kg</span>
        </li>
        <li>
          <span className="font-bold text-teal-300">3rd Attempt:</span>{" "}
          <span className="text-lg">{data["3rd Attempt"]} kg</span>
        </li>
      </ul>
    </div>
  );
};

export default RecommendationCard;
