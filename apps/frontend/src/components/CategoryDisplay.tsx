interface CategoryDisplayProps {
  categoryName: string;
  roundNumber: number;
}

export default function CategoryDisplay({ categoryName, roundNumber }: CategoryDisplayProps) {
  return (
    <div className="flex flex-col items-center space-y-element">
      <div className="font-sans text-xs text-text-secondary lowercase">
        ronda {roundNumber}
      </div>
      <div className="font-sans text-3xl font-medium lowercase text-text-primary">
        {categoryName.toLowerCase()}
      </div>
    </div>
  );
}
