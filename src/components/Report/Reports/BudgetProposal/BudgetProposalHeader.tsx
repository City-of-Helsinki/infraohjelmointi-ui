import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { memo } from 'react';
import logo from '@/assets/logo.png';

// Create styles (pdf docs can't be given rem for some reason)
const styles = StyleSheet.create({
  header: {
    maxWidth: '100%',
    width: '100%',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textAndLogo: {
    display: 'flex',
    flexDirection: 'row',
  },
  logo: {
    width: '80px',
    height: '37px',
    marginRight: '16px',
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
  },
});

const BudgetProposalHeader = () => (
  <View style={styles.header}>
    <View style={styles.textAndLogo}>
      <Image style={styles.logo} src={logo} />
      <View style={styles.text}>
        <Text style={{ fontWeight: 'bold' }}>
          Kaupunkiympäristön toimiala - Investointiohjelma 2023 - 2032
        </Text>
        <Text>Maankäyttö ja kaupunkirakenne</Text>
        <Text>LIKE/Toiminnanohjaus</Text>
      </View>
    </View>
    <Text>01.01.2023</Text>
  </View>
);

export default memo(BudgetProposalHeader);
