import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    Share,
    Platform,
} from 'react-native';
import { useTheme } from '@/components/theme-context';
import { useLogging } from '@/hooks/use-logging';
import { LogEntry, LogLevel } from '@/services/logger';
import { X, Share2, Trash2, Filter } from 'lucide-react-native';

interface LogViewerProps {
    visible: boolean;
    onClose: () => void;
}

export default function LogViewer({ visible, onClose }: LogViewerProps) {
    const { colors } = useTheme();
    const { getLogs, clearLogs, exportLogs, LogLevel } = useLogging();

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [filterLevel, setFilterLevel] = useState<LogLevel | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Load logs when the component mounts or becomes visible
    useEffect(() => {
        if (visible) {
            refreshLogs();
        }
    }, [visible, filterLevel]);

    // Refresh logs
    const refreshLogs = () => {
        const allLogs = getLogs();

        // Apply filter if set
        const filteredLogs = filterLevel
            ? allLogs.filter(log => {
                const levelIndex = Object.values(LogLevel).indexOf(log.level as LogLevel);
                const filterIndex = Object.values(LogLevel).indexOf(filterLevel);
                return levelIndex >= filterIndex;
            })
            : allLogs;

        setLogs(filteredLogs);
    };

    // Handle log item press
    const handleLogPress = (log: LogEntry) => {
        setSelectedLog(log);
    };

    // Handle clear logs
    const handleClearLogs = async () => {
        await clearLogs();
        setLogs([]);
    };

    // Handle share logs
    const handleShareLogs = async () => {
        try {
            const logsText = exportLogs();

            await Share.share({
                message: logsText,
                title: 'Application Logs',
            });
        } catch (error) {
            console.error('Error sharing logs:', error);
        }
    };

    // Get color for log level
    const getLogLevelColor = (level: LogLevel) => {
        switch (level) {
            case LogLevel.DEBUG:
                return '#9E9E9E'; // Gray
            case LogLevel.INFO:
                return '#2196F3'; // Blue
            case LogLevel.WARN:
                return '#FFC107'; // Yellow
            case LogLevel.ERROR:
                return '#F44336'; // Red
            default:
                return colors.text;
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString();
    };

    // Render log item
    const renderLogItem = ({ item }: { item: LogEntry }) => (
        <TouchableOpacity
            style={[styles.logItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleLogPress(item)}
        >
            <View style={styles.logHeader}>
                <Text style={[styles.logTime, { color: colors.textSecondary }]}>
                    {formatDate(item.timestamp)}
                </Text>
                <Text
                    style={[
                        styles.logLevel,
                        { color: getLogLevelColor(item.level as LogLevel) },
                    ]}
                >
                    {item.level}
                </Text>
            </View>
            <Text style={[styles.logMessage, { color: colors.text }]} numberOfLines={2}>
                {item.message}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Application Logs</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.toolbar}>
                    <TouchableOpacity
                        style={[styles.toolbarButton, { backgroundColor: colors.cardBackground }]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Filter size={20} color={filterLevel ? colors.primary : colors.text} />
                        <Text style={[styles.toolbarButtonText, { color: colors.text }]}>
                            {filterLevel ? `Filter: ${filterLevel}` : 'Filter'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolbarButton, { backgroundColor: colors.cardBackground }]}
                        onPress={handleShareLogs}
                    >
                        <Share2 size={20} color={colors.text} />
                        <Text style={[styles.toolbarButtonText, { color: colors.text }]}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolbarButton, { backgroundColor: colors.cardBackground }]}
                        onPress={handleClearLogs}
                    >
                        <Trash2 size={20} color={colors.error} />
                        <Text style={[styles.toolbarButtonText, { color: colors.error }]}>Clear</Text>
                    </TouchableOpacity>
                </View>

                {logs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No logs to display
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={logs}
                        renderItem={renderLogItem}
                        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
                        contentContainerStyle={styles.logsList}
                    />
                )}

                {/* Log Detail Modal */}
                <Modal
                    visible={selectedLog !== null}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setSelectedLog(null)}
                >
                    <View style={styles.detailModalOverlay}>
                        <View style={[styles.detailModalContent, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.detailModalHeader}>
                                <Text style={[styles.detailModalTitle, { color: colors.text }]}>Log Details</Text>
                                <TouchableOpacity onPress={() => setSelectedLog(null)}>
                                    <X size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {selectedLog && (
                                <ScrollView style={styles.detailModalBody}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time:</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {new Date(selectedLog.timestamp).toLocaleString()}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Level:</Text>
                                        <Text
                                            style={[
                                                styles.detailValue,
                                                { color: getLogLevelColor(selectedLog.level as LogLevel) },
                                            ]}
                                        >
                                            {selectedLog.level}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Message:</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedLog.message}
                                        </Text>
                                    </View>

                                    {selectedLog.screen && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Screen:</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                                {selectedLog.screen}
                                            </Text>
                                        </View>
                                    )}

                                    {selectedLog.userId && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>User ID:</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                                {selectedLog.userId}
                                            </Text>
                                        </View>
                                    )}

                                    {selectedLog.sessionId && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Session ID:</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                                {selectedLog.sessionId}
                                            </Text>
                                        </View>
                                    )}

                                    {selectedLog.context && (
                                        <View style={styles.detailSection}>
                                            <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>
                                                Context:
                                            </Text>
                                            <Text style={[styles.detailJson, { color: colors.text }]}>
                                                {JSON.stringify(selectedLog.context, null, 2)}
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Filter Modal */}
                <Modal
                    visible={showFilterModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowFilterModal(false)}
                >
                    <View style={styles.detailModalOverlay}>
                        <View style={[styles.filterModalContent, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.detailModalHeader}>
                                <Text style={[styles.detailModalTitle, { color: colors.text }]}>Filter Logs</Text>
                                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                    <X size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.filterOption,
                                    filterLevel === null && { backgroundColor: colors.primary + '20' },
                                ]}
                                onPress={() => {
                                    setFilterLevel(null);
                                    setShowFilterModal(false);
                                }}
                            >
                                <Text style={[styles.filterOptionText, { color: colors.text }]}>All Logs</Text>
                            </TouchableOpacity>

                            {Object.values(LogLevel).map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.filterOption,
                                        filterLevel === level && { backgroundColor: colors.primary + '20' },
                                    ]}
                                    onPress={() => {
                                        setFilterLevel(level as LogLevel);
                                        setShowFilterModal(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.filterOptionText,
                                            { color: getLogLevelColor(level as LogLevel) },
                                        ]}
                                    >
                                        {level} and above
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    toolbarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    toolbarButtonText: {
        marginLeft: 8,
    },
    logsList: {
        paddingHorizontal: 16,
    },
    logItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    logTime: {
        fontSize: 12,
    },
    logLevel: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    logMessage: {
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    },
    detailModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailModalContent: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 12,
        padding: 16,
    },
    detailModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailModalBody: {
        maxHeight: '90%',
    },
    detailRow: {
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
    },
    detailSection: {
        marginTop: 8,
    },
    detailSectionTitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    detailJson: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    filterModalContent: {
        width: '80%',
        borderRadius: 12,
        padding: 16,
    },
    filterOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    filterOptionText: {
        fontSize: 16,
    },
});