import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupMemberType } from '@/services/dataService';
import { useGroupOrderStore, PARTICIPANT_STATUS_CONFIG, ParticipantStatus } from '@/store';

interface MemberCardProps {
  members: GroupMemberType[];
  onMemberPress?: (member: GroupMemberType) => void;
}

/**
 * MemberSection displaying real-time participant status badges:
 * - "n'a pas encore rejoint"
 * - "en train de choisir"
 * - "a validé sa commande"
 */
export const MemberSection: React.FC<MemberCardProps> = ({ members, onMemberPress }) => {
  const memberStatuses = useGroupOrderStore((state) => state.memberStatuses);
  const updateMemberStatus = useGroupOrderStore((state) => state.updateMemberStatus);

  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
      {/* Header Title */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-bold text-slate-900">
          Membres du groupe ({members.length})
        </Text>
        <View className="flex-row items-center space-x-1">
          <View className="w-2 h-2 rounded-full bg-emerald-500" />
          <Text className="text-[10px] font-bold text-emerald-700 ml-1">Statuts en direct</Text>
        </View>
      </View>

      {/* Member Rows */}
      {members.map((member, index) => {
        // Compute active status from Zustand store or fallback
        const status: ParticipantStatus =
          memberStatuses[member.id] ||
          (member.isCreator || member.paymentStatus === 'paid'
            ? 'VALIDATED'
            : index % 2 === 0
            ? 'CHOOSING'
            : 'NOT_JOINED');

        const config = PARTICIPANT_STATUS_CONFIG[status] || PARTICIPANT_STATUS_CONFIG.NOT_JOINED;

        // Toggle simulation on member tap
        const handleToggleStatus = () => {
          const nextStatus: ParticipantStatus =
            status === 'NOT_JOINED'
              ? 'CHOOSING'
              : status === 'CHOOSING'
              ? 'VALIDATED'
              : 'NOT_JOINED';
          updateMemberStatus(member.id, nextStatus);
        };

        return (
          <View
            key={member.id || index}
            className={`py-3 ${index !== members.length - 1 ? 'border-b border-slate-100' : ''}`}
          >
            <View className="flex-row items-center justify-between">
              {/* Left Number, Avatar & Name */}
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-5 h-5 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Text className="text-[10px] font-bold text-emerald-800">{index + 1}</Text>
                </View>

                <Image
                  source={{ uri: member.avatar }}
                  className="w-9 h-9 rounded-full mr-2.5 border border-slate-200"
                />

                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-xs font-bold text-slate-900 mr-1.5" numberOfLines={1}>
                      {member.name}
                    </Text>
                    {member.role === 'Organisateur' && (
                      <View className="bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                        <Text className="text-[9px] font-bold text-emerald-700">Organisateur</Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-[10px] font-medium text-slate-400">
                    {member.paymentStatusText || 'Membre'}
                  </Text>
                </View>
              </View>

              {/* Right Amount */}
              <Text className="text-xs font-extrabold text-slate-800 ml-1">
                {member.amount} DH
              </Text>
            </View>

            {/* Interactive Participant Status Badge */}
            <View className="mt-2 flex-row items-center justify-between pl-7">
              <Pressable
                onPress={handleToggleStatus}
                className={`flex-row items-center px-2.5 py-1 rounded-xl border ${config.bgClass} active:opacity-80`}
              >
                <Ionicons
                  name={config.icon as any}
                  size={13}
                  color={config.dotColor}
                  style={{ marginRight: 5 }}
                />
                <Text className={`text-[10px] font-extrabold ${config.textClass}`}>
                  {config.label}
                </Text>
              </Pressable>

              <Pressable onPress={() => onMemberPress && onMemberPress(member)} hitSlop={10}>
                <Ionicons name="ellipsis-horizontal" size={16} color="#94a3b8" />
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default MemberSection;
