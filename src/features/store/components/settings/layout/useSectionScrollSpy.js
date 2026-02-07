import { useEffect, useMemo, useState } from "react";

const defaultThresholds = [0, 0.15, 0.35, 0.55, 0.75, 1];

/**
 * Scroll spy para resaltar secciones dentro de un contenedor.
 * @param {string[]} sectionIds
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {Object} [options]
 * @param {string} [options.rootMargin]
 * @param {number[]} [options.thresholds]
 */
export const useSectionScrollSpy = (sectionIds, containerRef, options = {}) => {
  const [activeSection, setActiveSection] = useState(sectionIds?.[0] || null);

  const normalizedIds = useMemo(() => {
    return Array.isArray(sectionIds) ? sectionIds.filter(Boolean) : [];
  }, [sectionIds]);

  useEffect(() => {
    if (!normalizedIds.length) return;
    setActiveSection(normalizedIds[0]);
  }, [normalizedIds]);

  useEffect(() => {
    const container = containerRef?.current || null;
    const rootMargin = options.rootMargin || "0px 0px -55% 0px";
    const thresholds = options.thresholds || defaultThresholds;

    const getElement = (id) => {
      if (container) return container.querySelector(`#${id}`);
      return document.getElementById(id);
    };

    const elements = normalizedIds.map(getElement).filter(Boolean);
    if (!elements.length) return;

    // Use viewport as root for scroll observation
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
          setActiveSection(visible[0].target.id);
        }
      },
      { root: null, rootMargin, threshold: thresholds },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [containerRef, normalizedIds, options.rootMargin, options.thresholds]);

  return { activeSection, setActiveSection };
};
