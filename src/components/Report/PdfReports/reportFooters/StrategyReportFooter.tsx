import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { FC, memo } from 'react';

// Create styles (pdf docs can't be given rem for some reason)
const styles = StyleSheet.create({
  footer: {
    maxWidth: '100%',
    width: '100%',
    marginTop: '25px',
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textAndLogo: {
    display: 'flex',
    flexDirection: 'row',
  },
  infoBoxes: {
    marginLeft: '770px',
    marginTop: '2px',
  },
  blackInfoBox: {
    width: '16px',
    height: '12px',
    backgroundColor: '#333333',
  },
  greenInfoBox: {
    marginTop: '2px',
    width: '16px',
    height: '12px',
    backgroundColor: '#00d7a7',
  },
  greyInfoBox: {
    marginTop: '2px',
    width: '16px',
    height: '12px',
    backgroundColor: '#cccccc',
  },
  infoText: {
    marginTop: '2px',
    fontSize: '9px',
    justifyContent: 'center',
    marginLeft: '2px',
  },
});

interface IStrategyTableFooterProps {
  colorInfoTextOne: string;
  colorInfoTextTwo: string;
  colorInfoTextThree: string;
}

const StrategyTableFooter: FC<IStrategyTableFooterProps> = ({
  colorInfoTextOne,
  colorInfoTextTwo,
  colorInfoTextThree,
}) => {
  return (
    <View fixed style={styles.footer}>
      <View style={styles.textAndLogo}>
        <View style={styles.infoBoxes}>
          <Text style={styles.blackInfoBox}></Text>
          <Text style={styles.greenInfoBox}></Text>
          <Text style={styles.greyInfoBox}></Text>
        </View>
        <View>
          <Text style={styles.infoText}>{colorInfoTextOne}</Text>
          <Text style={styles.infoText}>{colorInfoTextTwo}</Text>
          <Text style={styles.infoText}>{colorInfoTextThree}</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(StrategyTableFooter);
