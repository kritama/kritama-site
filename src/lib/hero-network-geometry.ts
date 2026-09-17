export type HeroNetworkTone = "primary" | "secondary" | "accent" | "muted";

export interface HeroNetworkLayer {
  count: number;
  index: number;
  x: number;
}

export interface HeroNetworkNode {
  id: string;
  index: number;
  layer: number;
  count: number;
  x: number;
  y: string;
  yValue: number;
  tone: HeroNetworkTone;
  major: boolean;
}

export interface HeroNetworkLink {
  d: string;
  tone: "primary" | "secondary" | "accent";
}

export interface HeroNetworkRouteOption {
  d: string;
  tone: "primary" | "secondary" | "accent";
}

const heroNetworkCoord = (value: number): string => value.toFixed(1);

export function heroNetworkLayers(): HeroNetworkLayer[] {
  const counts = [1, 5, 10, 10, 5, 1];
  const xPositions = [92, 246, 400, 560, 714, 868];

  return counts.map((count, layer) => ({
    count,
    index: layer,
    x: xPositions[layer],
  }));
}

export function heroNetworkNodes(): HeroNetworkNode[] {
  const tones: HeroNetworkTone[] = ["primary", "secondary", "accent", "muted"];

  return heroNetworkLayers().flatMap((layer) => {
    return Array.from({ length: layer.count }, (_, nodeIndex) => {
      const y =
        layer.count === 1 ? 260.0 : 70.0 + nodeIndex * (380.0 / (layer.count - 1));

      return {
        id: `hero-network-${layer.index}-${nodeIndex}`,
        index: nodeIndex,
        layer: layer.index,
        count: layer.count,
        x: layer.x,
        y: heroNetworkCoord(y),
        yValue: y,
        tone: tones[(layer.index + nodeIndex) % tones.length],
        major: layer.count === 1,
      };
    });
  });
}

const heroNetworkLinkTargets = (
  sourceIndex: number,
  sourceCount: number,
  targetCount: number
): number[] => {
  if (sourceCount === 1) return Array.from({ length: targetCount }, (_, i) => i);
  if (targetCount === 1) return [0];

  const center = Math.round(sourceIndex * ((targetCount - 1) / (sourceCount - 1)));

  return [...new Set([center - 1, center, center + 1].filter((i) => i >= 0 && i < targetCount))];
};

const heroNetworkLinkSegment = (
  source: Pick<HeroNetworkNode, "x" | "yValue">,
  target: Pick<HeroNetworkNode, "x" | "yValue">
): string => {
  const controlGap = (target.x - source.x) * 0.48;
  const firstControlX = heroNetworkCoord(source.x + controlGap);
  const secondControlX = heroNetworkCoord(target.x - controlGap);

  return `C${firstControlX} ${heroNetworkCoord(source.yValue)} ${secondControlX} ${heroNetworkCoord(
    target.yValue
  )} ${target.x} ${heroNetworkCoord(target.yValue)}`;
};

export function heroNetworkLinks(nodes: HeroNetworkNode[]): HeroNetworkLink[] {
  const nodesByLayer = new Map<number, HeroNetworkNode[]>();
  for (const node of nodes) {
    const layerNodes = nodesByLayer.get(node.layer) ?? [];
    layerNodes.push(node);
    nodesByLayer.set(node.layer, layerNodes);
  }

  const tones = ["primary", "secondary", "accent"] as const;
  const links: HeroNetworkLink[] = [];

  for (let layer = 0; layer <= 4; layer++) {
    const sources = nodesByLayer.get(layer)!;
    const targets = nodesByLayer.get(layer + 1)!;

    for (const source of sources) {
      for (const targetIndex of heroNetworkLinkTargets(source.index, sources.length, targets.length)) {
        const target = targets[targetIndex];
        const d = `M${source.x} ${source.y} ${heroNetworkLinkSegment(source, target)}`;
        links.push({ d, tone: tones[(source.index + layer) % 3] });
      }
    }
  }

  return links;
}

export function heroNetworkRouteOptions(nodes: HeroNetworkNode[]): HeroNetworkRouteOption[] {
  const nodesByLayer = new Map<number, HeroNetworkNode[]>();
  for (const node of nodes) {
    const layerNodes = nodesByLayer.get(node.layer) ?? [];
    layerNodes.push(node);
    nodesByLayer.set(node.layer, layerNodes);
  }

  const routes: { indexes: number[]; tone: "primary" | "secondary" | "accent" }[] = [
    { indexes: [0, 0, 1, 2, 1, 0], tone: "primary" },
    { indexes: [0, 1, 3, 4, 0, 0], tone: "primary" },
    { indexes: [0, 2, 5, 3, 4, 0], tone: "secondary" },
    { indexes: [0, 3, 6, 7, 2, 0], tone: "secondary" },
    { indexes: [0, 4, 8, 9, 3, 0], tone: "accent" },
    { indexes: [0, 1, 3, 6, 0, 0], tone: "primary" },
    { indexes: [0, 2, 4, 5, 1, 0], tone: "accent" },
    { indexes: [0, 4, 9, 8, 4, 0], tone: "secondary" },
  ];

  return routes.map((route) => {
    const routeNodes = route.indexes.map((nodeIndex, layerIndex) =>
      nodesByLayer.get(layerIndex)![nodeIndex]
    );

    const [entry, ...rest] = routeNodes;
    let d = `M0 260 C30 260 62 260 ${entry.x} ${entry.y}`;

    for (let i = 0; i < rest.length; i++) {
      d += ` ${heroNetworkLinkSegment(routeNodes[i], rest[i])}`;
    }

    return { d, tone: route.tone };
  });
}
