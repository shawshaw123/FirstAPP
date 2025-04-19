import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { useTheme } from '@/components/theme-context';
import { useConcurrentOperations } from '@/hooks/use-concurrent-operations';
import { TaskStatus, QueueTask } from '@/components/concurrent-queue';
import { X, Play, Pause, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react-native';

interface TaskMonitorProps {
    visible: boolean;
    onClose: () => void;
}

export default function TaskMonitor({ visible, onClose }: TaskMonitorProps) {
    const { colors } = useTheme();
    const {
        tasks,
        isProcessing,
        stats,
        clearCompletedTasks,
        pauseQueue,
        resumeQueue,
    } = useConcurrentOperations();

    const [selectedTask, setSelectedTask] = useState<QueueTask | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Force refresh every second while processing
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isProcessing && visible) {
            intervalId = setInterval(() => {
                setRefreshKey(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isProcessing, visible]);

    // Get status icon
    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.PENDING:
                return <Clock size={16} color="#FFC107" />;
            case TaskStatus.RUNNING:
                return <RefreshCw size={16} color="#2196F3" />;
            case TaskStatus.COMPLETED:
                return <CheckCircle size={16} color="#4CAF50" />;
            case TaskStatus.FAILED:
                return <XCircle size={16} color="#F44336" />;
            case TaskStatus.CANCELLED:
                return <AlertCircle size={16} color="#9E9E9E" />;
            default:
                return null;
        }
    };

    // Get status color
    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.PENDING:
                return '#FFC107'; // Yellow
            case TaskStatus.RUNNING:
                return '#2196F3'; // Blue
            case TaskStatus.COMPLETED:
                return '#4CAF50'; // Green
            case TaskStatus.FAILED:
                return '#F44336'; // Red
            case TaskStatus.CANCELLED:
                return '#9E9E9E'; // Gray
            default:
                return colors.text;
        }
    };

    // Format date for display
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    // Format duration
    const formatDuration = (startTime?: number, endTime?: number) => {
        if (!startTime) return 'Not started';
        const end = endTime || Date.now();
        const durationMs = end - startTime;

        if (durationMs < 1000) {
            return `${durationMs}ms`;
        } else if (durationMs < 60000) {
            return `${(durationMs / 1000).toFixed(1)}s`;
        } else {
            const minutes = Math.floor(durationMs / 60000);
            const seconds = Math.floor((durationMs % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        }
    };

    // Render task item
    const renderTaskItem = ({ item }: { item: QueueTask }) => (
        <TouchableOpacity
            style={[styles.taskItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => setSelectedTask(item)}
        >
            <View style={styles.taskHeader}>
                <View style={styles.taskStatus}>
                    {getStatusIcon(item.status)}
                    <Text
                        style={[
                            styles.taskStatusText,
                            { color: getStatusColor(item.status) },
                        ]}
                    >
                        {item.status}
                    </Text>
                </View>
                <Text style={[styles.taskTime, { color: colors.textSecondary }]}>
                    {formatDate(item.createdAt)}
                </Text>
            </View>

            <View style={styles.taskInfo}>
                <Text style={[styles.taskId, { color: colors.textSecondary }]}>
                    ID: {item.id.substring(0, 8)}...
                </Text>

                {item.startedAt && (
                    <Text style={[styles.taskDuration, { color: colors.text }]}>
                        Duration: {formatDuration(item.startedAt, item.completedAt)}
                    </Text>
                )}
            </View>
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
                    <Text style={[styles.title, { color: colors.text }]}>Task Monitor</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.statsTitle, { color: colors.textSecondary }]}>Queue Status</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{stats.pending}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{stats.running}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Running</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{stats.completed}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{stats.failed + stats.cancelled}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Failed</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.toolbar}>
                    {isProcessing ? (
                        <TouchableOpacity
                            style={[styles.toolbarButton, { backgroundColor: colors.cardBackground }]}
                            onPress={pauseQueue}
                        >
                            <Pause size={20} color={colors.text} />
                            <Text style={[styles.toolbarButtonText, { color: colors.text }]}>Pause</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.toolbarButton, { backgroundColor: colors.cardBackground }]}
                            onPress={resumeQueue}
                        >
                            <Play size={20} color={colors.text} />
                            <Text style={[styles.toolbarButtonText, { color: colors.text }]}>Resume</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.toolbarButton, { backgroundColor: colors.cardBackground }]}
                        onPress={clearCompletedTasks}
                    >
                        <CheckCircle size={20} color={colors.text} />
                        <Text style={[styles.toolbarButtonText, { color: colors.text }]}>Clear Completed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toolbarButton, { backgroundColor: colors.cardBackground }]}
                        onPress={() => setRefreshKey(prev => prev + 1)}
                    >
                        <RefreshCw size={20} color={colors.text} />
                        <Text style={[styles.toolbarButtonText, { color: colors.text }]}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Tasks</Text>

                {tasks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No tasks to display
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={tasks}
                        renderItem={renderTaskItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.tasksList}
                        extraData={refreshKey}
                    />
                )}

                {/* Task Detail Modal */}
                <Modal
                    visible={selectedTask !== null}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setSelectedTask(null)}
                >
                    <View style={styles.detailModalOverlay}>
                        <View style={[styles.detailModalContent, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.detailModalHeader}>
                                <Text style={[styles.detailModalTitle, { color: colors.text }]}>Task Details</Text>
                                <TouchableOpacity onPress={() => setSelectedTask(null)}>
                                    <X size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {selectedTask && (
                                <ScrollView style={styles.detailModalBody}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>ID:</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTask.id}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status:</Text>
                                        <Text
                                            style={[
                                                styles.detailValue,
                                                { color: getStatusColor(selectedTask.status) },
                                            ]}
                                        >
                                            {selectedTask.status}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Priority:</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTask.priority}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Created:</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {new Date(selectedTask.createdAt).toLocaleString()}
                                        </Text>
                                    </View>

                                    {selectedTask.startedAt && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Started:</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                                {new Date(selectedTask.startedAt).toLocaleString()}
                                            </Text>
                                        </View>
                                    )}

                                    {selectedTask.completedAt && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Completed:</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                                {new Date(selectedTask.completedAt).toLocaleString()}
                                            </Text>
                                        </View>
                                    )}

                                    {selectedTask.startedAt && (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Duration:</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                                {formatDuration(selectedTask.startedAt, selectedTask.completedAt)}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Retries:</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {selectedTask.retries} / {selectedTask.maxRetries}
                                        </Text>
                                    </View>

                                    {selectedTask.result && (
                                        <View style={styles.detailSection}>
                                            <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>
                                                Result:
                                            </Text>
                                            <Text style={[styles.detailJson, { color: colors.text }]}>
                                                {JSON.stringify(selectedTask.result, null, 2)}
                                            </Text>
                                        </View>
                                    )}

                                    {selectedTask.error && (
                                        <View style={styles.detailSection}>
                                            <Text style={[styles.detailSectionTitle, { color: colors.textSecondary }]}>
                                                Error:
                                            </Text>
                                            <Text style={[styles.detailJson, { color: colors.error }]}>
                                                {JSON.stringify(selectedTask.error, null, 2)}
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            )}
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
        paddingTop: 50,
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
    statsContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    statsCard: {
        borderRadius: 12,
        padding: 16,
    },
    statsTitle: {
        fontSize: 14,
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    tasksList: {
        paddingHorizontal: 16,
    },
    taskItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    taskStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskStatusText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    taskTime: {
        fontSize: 12,
    },
    taskInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    taskId: {
        fontSize: 12,
    },
    taskDuration: {
        fontSize: 12,
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
        fontFamily: 'monospace',
    },
});