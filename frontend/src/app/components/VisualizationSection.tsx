import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface Visualization {
  box_plot: string;
  heatmap_plot: string;
  bar_plot: string;
}

const VisualizationSection = ({
  visualizations,
}: {
  visualizations: Visualization;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      const images = sectionRef.current.querySelectorAll("img");
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.inOut" }
      );
      gsap.fromTo(
        images,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    }
  }, []);

  return (
    <div ref={sectionRef} className="max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl text-teal-200 mb-4 text-center font-bold">
        Visualizations
      </h2>
      <div className="space-y-6">
        <img
          src={`data:image/png;base64,${visualizations.box_plot}`}
          alt="Box Plot"
          className="w-full rounded-lg shadow-lg"
        />
        <img
          src={`data:image/png;base64,${visualizations.heatmap_plot}`}
          alt="Attempt Progression Heatmap"
          className="w-full rounded-lg shadow-lg"
        />
        <img
          src={`data:image/png;base64,${visualizations.bar_plot}`}
          alt="Lift Contributions Stacked Bar"
          className="w-full rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default VisualizationSection;
