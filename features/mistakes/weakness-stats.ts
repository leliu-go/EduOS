export type KnowledgePointWeaknessCountRow = {
  knowledgePointId: string;
  _count: {
    _all: number;
  };
};

export type WeaknessKnowledgePoint = {
  id: string;
  name: string;
  chapter: string;
  subject: {
    name: string;
  };
  grade: {
    name: string;
  };
  parent: {
    name: string;
  } | null;
};

export type KnowledgePointWeaknessStat = {
  knowledgePointId: string;
  label: string;
  count: number;
};

function getKnowledgePointLabel(knowledgePoint: WeaknessKnowledgePoint) {
  const parentName = knowledgePoint.parent ? ` · ${knowledgePoint.parent.name}` : "";

  return `${knowledgePoint.subject.name} · ${knowledgePoint.grade.name} · ${knowledgePoint.chapter}${parentName} · ${knowledgePoint.name}`;
}

export function buildKnowledgePointWeaknessStats(
  rows: KnowledgePointWeaknessCountRow[],
  knowledgePoints: WeaknessKnowledgePoint[],
): KnowledgePointWeaknessStat[] {
  const knowledgePointById = new Map(knowledgePoints.map((item) => [item.id, item]));

  return rows
    .flatMap((row) => {
      const knowledgePoint = knowledgePointById.get(row.knowledgePointId);

      if (!knowledgePoint) {
        return [];
      }

      return [
        {
          knowledgePointId: row.knowledgePointId,
          label: getKnowledgePointLabel(knowledgePoint),
          count: row._count._all,
        },
      ];
    })
    .sort((left, right) => right.count - left.count);
}
