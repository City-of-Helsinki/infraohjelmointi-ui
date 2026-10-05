import { StyleSheet } from '@react-pdf/renderer';

const BLUE = '#0000bf';
const GREY = '#666666';

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'HelsinkiGrotesk',
    fontSize: '10px',
    color: '#1a1a1a',
    paddingTop: '16px',
    paddingBottom: '56px',
    paddingHorizontal: '40px',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '20px',
  },
  draftTag: {
    backgroundColor: '#ffda07',
    paddingVertical: '3px',
    paddingHorizontal: '8px',
    marginRight: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  completeTag: {
    backgroundColor: '#007a64',
    color: 'white',
    paddingVertical: '3px',
    paddingHorizontal: '8px',
    marginRight: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  mutedText: {
    color: GREY,
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: BLUE,
    borderBottom: `2px solid ${BLUE}`,
    paddingBottom: '4px',
    marginBottom: '10px',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridField: {
    width: '50%',
    paddingRight: '12px',
    marginBottom: '8px',
  },
  field: {
    marginBottom: '8px',
  },
  fieldLabel: {
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  fieldValue: {
    lineHeight: 1.4,
  },
  link: {
    color: BLUE,
    marginBottom: '2px',
  },
  footer: {
    position: 'absolute',
    bottom: '20px',
    left: '40px',
    right: '40px',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #cccccc',
    paddingTop: '6px',
    fontSize: '8px',
    color: GREY,
  },
});
