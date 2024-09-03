"use client";
import Linkify from "react-linkify";

type Props = {
  passage: string;
};

export default function LinkifyPassage({ passage }: Props) {
  const componentDecorator = (href: string, text: string, key: number) => (
    <>
      <a
        href={href}
        key={key}
        className="text-blue-600 dark:text-blue-500 hover:underline"
      >
        {text}
      </a>
      {/* ref: https://nknuahuang.wordpress.com/2020/04/23/how-to-make-a-responsive-100-width-youtube-iframe-embed/ */}
      <div className="mt-2 relative w-full h-0 pb-[56.25%]">
        <iframe
          src={href.replace("watch?v=", "embed/")}
          title={`preview-${key}`}
          className="top-0 left-0 w-full h-full absolute"
        ></iframe>
      </div>
    </>
  );

  return (
    <Linkify componentDecorator={componentDecorator}>
      <div className="whitespace-pre-wrap text-justify">{passage}</div>
    </Linkify>
  );
}
