import type { FunctionComponent } from "../jsx-test/jsx/jsx-runtime";

const Theo: FunctionComponent = ({ children }) => {
  return (
    <div>
      <h1>Theo</h1>
      {children}
    </div>
  );
};
