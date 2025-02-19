import { View, StyleSheet } from '@react-pdf/renderer';
import { memo } from 'react';

// Create styles (pdf docs can't be given rem for some reason)
const styles = StyleSheet.create({
  footer: {
    maxWidth: '100%',
    width: '100%',
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

const DefaultReportFooter = () => {
  return (
    <View fixed style={styles.footer}/>
  );
};

export default memo(DefaultReportFooter);