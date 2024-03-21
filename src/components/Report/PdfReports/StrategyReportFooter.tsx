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
  text: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '9px'
  },
  infoBoxes: {
    marginLeft: '670px',
    marginTop: '2px',
  },
  blackInfoBox: {
    width: '16px',
    height: '12px',
    backgroundColor: '#333333'
  },
  greenInfoBox: {
    marginTop: '2px',
    width: '16px',
    height: '12px',
    backgroundColor: '#00d7a7'
  },
  infoText: {
    marginTop: '2px',
    fontSize: '9px',
    justifyContent: 'center',
    marginLeft: '2px'
  }
});

interface IStrategyTableFooterProps {
  infoText: string;
  colorInfoTextOne: string;
  colorInfoTextTwo: string;
}

const StrategyTableFooter: FC<IStrategyTableFooterProps> = ({infoText, colorInfoTextOne, colorInfoTextTwo}) => {
  return (
    <View fixed style={styles.footer}>
      <View style={styles.textAndLogo}>
        <View style={styles.text}>
          <Text>{infoText}</Text>
        </View>
        <View style={styles.infoBoxes}>
            <Text style={styles.blackInfoBox}></Text>
            <Text style={styles.greenInfoBox}></Text>
        </View>
        <View>
            <Text style={styles.infoText}>{colorInfoTextOne}</Text>
            <Text style={styles.infoText}>{colorInfoTextTwo}</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(StrategyTableFooter);