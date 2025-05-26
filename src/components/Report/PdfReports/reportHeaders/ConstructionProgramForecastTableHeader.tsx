import { View, StyleSheet, Text } from '@react-pdf/renderer';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const cellStyles = {
    width: '56px',
    textAlign: 'left' as unknown as 'left',
    paddingRight: '6px',
    paddingLeft: '6px',
    alignItems: 'center' as unknown as 'center',
};

const styles = StyleSheet.create({
    tableHeader: {
        paddingTop: '4px',
        paddingBottom: '4px',
        backgroundColor: '#0000bf',
        fontSize: '8px',
        fontWeight: 500,
        color: 'white',
        borderBottom: '1px solid #808080',
    },
    tableHeaderRow: {
        flexDirection: 'row',
    },
    projectCell: {
        ...cellStyles,
        paddingLeft: '21px',
        width: '300px',
    },
    projectLocationCell: {
        ...cellStyles,
        width: '113px',
        paddingRight: '15px',
        paddingLeft: '6px'
    },
    projectPhaseCell: {
        ...cellStyles,
        width: '60px',
    },
    budgetCell: {
        ...cellStyles,
        paddingLeft: '6px',
        paddingRight: '6px',
        width: '55px',
    },
    budgetOverrunReasonCell: {
        ...cellStyles,
        paddingRight: '21px',
        paddingLeft: '6px',
        width: '280px',
    },
})

const ConstructionProgramForecastTableHeader = () => {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <View style={styles.tableHeader}>
            <View style={styles.tableHeaderRow}>
                <Text style={styles.projectCell}>{`${t('report.constructionProgramForecast.projectTitle')}`}</Text>
                <Text style={styles.projectLocationCell}>{`${t('report.constructionProgramForecast.locationTitle')}`}</Text>
                <Text style={styles.budgetCell}>{`${t('report.constructionProgramForecast.budgetTitle')}`}</Text>
                <Text style={styles.projectPhaseCell}>{`${t('report.constructionProgramForecast.scheduleTitle')}`}</Text>
                <Text style={styles.budgetCell}>{`${t('report.constructionProgramForecast.isProjectOnScheduleTitle')}`}</Text>
                <Text style={styles.budgetCell}>{`${t('report.constructionProgramForecast.commitmentsBeforeYearTitle')} ${year}`}</Text>
                <Text style={styles.budgetCell}>{`${t('report.constructionProgramForecast.commitmentsYearTitle')} ${year}`}</Text>
                <Text style={styles.budgetCell}>{`${t('report.shared.ta')} ${year}`}</Text>
                <Text style={styles.budgetCell}>{`${t('report.constructionProgramForecast.forecast1Title')}`}</Text>
                <Text style={styles.budgetCell}>{`${t('report.constructionProgramForecast.differenceTitle')}${year}`}</Text>
                <Text style={styles.budgetCell}>{`${t('report.constructionProgramForecast.differencePercentTitle', {year: year})}`}</Text>
                <Text style={styles.budgetOverrunReasonCell}>{`\n${t('report.constructionProgramForecast.differenceReasonTitle')}`}</Text>
            </View>
        </View>
    )
}

export default memo(ConstructionProgramForecastTableHeader);
