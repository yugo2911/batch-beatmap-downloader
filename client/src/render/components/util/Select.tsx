import { type StylesConfig } from 'react-select';

export const styles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    background: '#fff',
    borderColor: '#9e9e9e',
    minHeight: '34px',
    height: '34px',
  }),

  valueContainer: (provided, state) => ({
    ...provided,
    height: '34px',
    paddingLeft: '4px',
    paddingTop: '0px',
  }),

  input: (provided, state) => ({
    ...provided,
    height: '34px',
    margin: '0px',
    paddingTop: '0px',
  }),
  indicatorSeparator: state => ({
    display: 'none',
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: '34px',
  }),
}
