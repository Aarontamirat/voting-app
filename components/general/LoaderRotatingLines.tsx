import { RotatingLines } from "react-loader-spinner";

type LoaderRotatingLinesProps = {
  style: { h: string; w: string; color: string; strokeWidth: number };
};

export default function LoaderRotatingLines(style: LoaderRotatingLinesProps) {
  return (
    <div className="flex items-center justify-center">
      <RotatingLines
        height={style.style.h}
        width={style.style.w}
        color={style.style.color}
        strokeWidth={style.style.strokeWidth}
        ariaLabel="rotating-lines-loading"
      />
    </div>
  );
}
