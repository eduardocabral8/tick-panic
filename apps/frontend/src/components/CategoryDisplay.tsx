interface CategoryDisplayProps {
  categoryName: string;
}

export default function CategoryDisplay({ categoryName }: CategoryDisplayProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-sans text-3xl font-medium lowercase text-text-primary">
        {categoryName.toLowerCase()}
      </div>
    </div>
  );
}
