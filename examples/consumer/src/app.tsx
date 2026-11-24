interface AppProperties {
  readonly name: string;
}

export const App = ({ name }: AppProperties) => <p>{name}</p>;
