import { cx } from "../utils/classNames";

const ROTOR_POSITIONS = ["tl", "tr", "bl", "br"] as const;

export type QuadcopterProps = {
  className?: string;
};

export function Quadcopter({ className }: QuadcopterProps) {
  return (
    <div className={cx("domcraft-quadcopter", className)}>
      <div className="domcraft-quadcopter__scan" />
      <div className="domcraft-quadcopter__arm domcraft-quadcopter__arm--diagonal-a" />
      <div className="domcraft-quadcopter__arm domcraft-quadcopter__arm--diagonal-b" />
      <div className="domcraft-quadcopter__nose" />
      <div className="domcraft-quadcopter__body" />
      <div className="domcraft-quadcopter__camera" />
      {ROTOR_POSITIONS.map((position) => (
        <div
          className={cx(
            "domcraft-quadcopter__rotor",
            `domcraft-quadcopter__rotor--${position}`,
          )}
          key={position}
        >
          <div className="domcraft-quadcopter__motor" />
          <div className="domcraft-quadcopter__rotor-spin">
            <div className="domcraft-quadcopter__propeller domcraft-quadcopter__propeller--a" />
            <div className="domcraft-quadcopter__propeller domcraft-quadcopter__propeller--b" />
          </div>
          <div className="domcraft-quadcopter__hub" />
        </div>
      ))}
    </div>
  );
}
