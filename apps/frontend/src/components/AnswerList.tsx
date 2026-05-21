interface Answer {
  id: string;
  text: string;
  isValid: boolean | null;
}

interface AnswerListProps {
  answers: Answer[];
}

export default function AnswerList({ answers }: AnswerListProps) {
  return (
    <ul className="space-y-element">
      {answers.map((answer) => {
        const isValid = answer.isValid === true;
        const isInvalid = answer.isValid === false;

        return (
          <li
            key={answer.id}
            className={`font-sans text-sm ${
              isValid
                ? 'text-accent'
                : isInvalid
                  ? 'text-error line-through'
                  : 'text-text-primary'
            }`}
          >
            {answer.isValid === null && (
              <span className="text-text-secondary mr-element">&#8226;</span>
            )}
            {answer.text}
          </li>
        );
      })}
    </ul>
  );
}
