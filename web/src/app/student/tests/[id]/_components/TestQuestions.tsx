"use client";
import Linkify from "react-linkify";

type Props = {
  questions: string;
};

export default function LinkifyTestQuestions({ questions }: Props) {
  const componentDecorator = (href: string, text: string, key: number) => (
    <a
      href={href}
      key={key}
      className="text-blue-600 dark:text-blue-500 hover:underline"
    >
      {text}
    </a>
  );

  return (
    <Linkify componentDecorator={componentDecorator}>
      <p className="whitespace-pre-wrap text-justify">{questions}</p>
    </Linkify>
  );
}
