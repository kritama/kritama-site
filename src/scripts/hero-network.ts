interface HeroNetworkActor {
  pulse: SVGGElement;
  activeRoute: SVGPathElement;
  routeIndex: number | null;
  duration: number;
  startedAt: number;
  length: number;
}

const TONE_CLASSES = [
  "hero-network-active-route-primary",
  "hero-network-active-route-secondary",
  "hero-network-active-route-accent",
];

export const initHeroNetwork = (el: HTMLElement) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const routeOptions = Array.from(el.querySelectorAll<SVGPathElement>(".hero-network-route-option")).map(
    (route, index) => ({
      index,
      d: route.getAttribute("d"),
      tone: route.dataset.tone || "primary",
    })
  );
  const activeRoutes = Array.from(el.querySelectorAll<SVGPathElement>("[data-hero-active-route]"));
  const pulses = Array.from(el.querySelectorAll<SVGGElement>("[data-hero-pulse]"));

  if (!routeOptions.length || !activeRoutes.length || !pulses.length) return;

  let animationFrame: number | null = null;
  let visibilityObserver: IntersectionObserver | null = null;

  const now = performance.now();
  const actors: HeroNetworkActor[] = pulses.map((pulse, index) => ({
    pulse,
    activeRoute: activeRoutes[index],
    routeIndex: null,
    duration: 7200 + index * 620,
    startedAt: now - index * 1700,
    length: 0,
  }));

  const resetActorTimings = () => {
    const now = performance.now();
    actors.forEach((actor, index) => {
      actor.startedAt = now - index * 1700;
    });
  };

  const hideActors = () => {
    actors.forEach((actor) => {
      actor.activeRoute.style.opacity = "0";
      actor.pulse.style.opacity = "0";
    });
  };

  const pickRoute = (actor: HeroNetworkActor) => {
    let candidates = routeOptions;
    if (actor.routeIndex !== null && routeOptions.length > 1) {
      candidates = routeOptions.filter((route) => route.index !== actor.routeIndex);
    }

    const route = candidates[Math.floor(Math.random() * candidates.length)];
    actor.routeIndex = route.index;
    actor.duration = 6800 + Math.floor(Math.random() * 2600);

    actor.activeRoute.setAttribute("d", route.d!);
    actor.activeRoute.classList.remove(...TONE_CLASSES);
    actor.activeRoute.classList.add(`hero-network-active-route-${route.tone}`);
    actor.activeRoute.style.opacity = "0";

    actor.pulse.classList.remove(
      "hero-network-pulse-primary",
      "hero-network-pulse-secondary",
      "hero-network-pulse-accent"
    );
    actor.pulse.classList.add(`hero-network-pulse-${route.tone}`);
    actor.pulse.style.opacity = "0";

    actor.length = actor.activeRoute.getTotalLength();
  };

  const tick = (timestamp: number) => {
    actors.forEach((actor) => {
      if (actor.routeIndex === null) {
        pickRoute(actor);
      }

      let elapsed = timestamp - actor.startedAt;

      if (elapsed >= actor.duration) {
        actor.startedAt = timestamp;
        elapsed = 0;
        pickRoute(actor);
      }

      const progress = Math.max(0, Math.min(elapsed / actor.duration, 1));
      const point = actor.activeRoute.getPointAtLength(actor.length * progress);
      const routeOpacity = Math.sin(progress * Math.PI) * 0.5;
      const pulseOpacity = progress < 0.04 || progress > 0.98 ? routeOpacity * 2 : 1;

      actor.activeRoute.style.opacity = routeOpacity.toFixed(3);
      actor.pulse.style.opacity = pulseOpacity.toFixed(3);
      actor.pulse.setAttribute("transform", `translate(${point.x} ${point.y})`);
    });

    animationFrame = requestAnimationFrame(tick);
  };

  const startAnimation = () => {
    if (animationFrame) return;

    resetActorTimings();
    animationFrame = requestAnimationFrame(tick);
  };

  const stopAnimation = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    hideActors();
  };

  if ("IntersectionObserver" in window) {
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(el);
  } else {
    startAnimation();
  }
};
