type BarProps = {
  width: string;
  secondaryWidth?: string;
};

const Bar = ({ width, secondaryWidth }: BarProps) => (<div className="bar-container" >
  <div className="percentage-bar" style={{
    width
  }}>
  {secondaryWidth && <div className="percentage-bar" style={{ width: secondaryWidth }} />}
  </div>
</div>)

export { Bar };