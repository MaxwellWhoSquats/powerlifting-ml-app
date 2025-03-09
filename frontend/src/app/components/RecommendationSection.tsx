import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import RecommendationCard from "./RecommendationCard";

interface Recommendation {
  Squat: {
    "1st Attempt": number;
    "2nd Attempt": number;
    "3rd Attempt": number;
  };
  Bench: {
    "1st Attempt": number;
    "2nd Attempt": number;
    "3rd Attempt": number;
  };
  Deadlift: {
    "1st Attempt": number;
    "2nd Attempt": number;
    "3rd Attempt": number;
  };
}

const RecommendationSection = ({
  recommendations,
}: {
  recommendations: Recommendation;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLDivElement>(null);

  // Calculate total from 3rd attempts
  const total = (
    recommendations.Squat["3rd Attempt"] +
    recommendations.Bench["3rd Attempt"] +
    recommendations.Deadlift["3rd Attempt"]
  ).toFixed(1);

  useEffect(() => {
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll(".recommendation-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.2, ease: "power2.out" }
      );
    }
    if (totalRef.current) {
      gsap.fromTo(
        totalRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.7)",
          delay: 0.6,
        }
      );
    }
  }, [recommendations]);

  return (
    <div ref={sectionRef} className="max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl text-teal-200 mb-4 text-center font-bold">
        Recommended Attempts (kg)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["Squat", "Bench", "Deadlift"] as const).map((lift) => (
          <div key={lift} className="recommendation-card">
            <RecommendationCard lift={lift} data={recommendations[lift]} />
          </div>
        ))}
      </div>
      <div ref={totalRef} className="text-center mt-6">
        <p className="text-2xl text-teal-200 font-bold">
          Estimated Total: {total} kg
        </p>
      </div>
    </div>
  );
};

export default RecommendationSection;
