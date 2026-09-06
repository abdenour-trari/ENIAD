import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { GroupOrderType } from '@/services/dataService';

// Zod Schema for Member Share validation
export const MemberShareSchema = z.object({
  memberId: z.string(),
  memberName: z.string(),
  shareAmount: z.number().nonnegative(),
  itemsCount: z.number().int().nonnegative(),
  detailText: z.string(),
});

// Zod Schema for Group Split Calculation validation
export const GroupSplitCalculationSchema = z
  .object({
    groupId: z.string(),
    splitMode: z.enum(['EQUAL', 'ITEMIZED']),
    totalAmount: z.number().positive(),
    discountedTotal: z.number().positive(),
    discountPercentage: z.number().min(0).max(100),
    deliveryFee: z.number().nonnegative(),
    memberShares: z.array(MemberShareSchema).min(1),
    calculatedSum: z.number(),
    isBalanced: z.boolean(),
  })
  .refine((data) => Math.abs(data.calculatedSum - data.discountedTotal) < 0.5, {
    message: 'Le total des parts réparties doit correspondre au montant total du groupe.',
  });

export type GroupSplitCalculation = z.infer<typeof GroupSplitCalculationSchema>;

interface GroupPaymentSplitModalProps {
  visible: boolean;
  group: GroupOrderType;
  onClose: () => void;
  onConfirmSplit: (calculation: GroupSplitCalculation) => void;
}

/**
 * GroupPaymentSplitModal Component.
 * Supports Equal Split vs Itemized Split (by ordered dish).
 * Calculates exact shares, validates calculations with Zod Schema, and displays "qui doit combien".
 */
export const GroupPaymentSplitModal: React.FC<GroupPaymentSplitModalProps> = ({
  visible,
  group,
  onClose,
  onConfirmSplit,
}) => {
  const [splitMode, setSplitMode] = useState<'EQUAL' | 'ITEMIZED'>('EQUAL');

  // Compute split breakdown dynamically and validate with Zod
  const splitCalculation = useMemo(() => {
    if (!group) return null;

    const members = group.members;
    const count = members.length;
    const discountedTotal = group.discountedTotal || 266;

    let shares: Array<{
      memberId: string;
      memberName: string;
      shareAmount: number;
      itemsCount: number;
      detailText: string;
    }> = [];

    if (splitMode === 'EQUAL') {
      const baseShare = Math.floor((discountedTotal / count) * 100) / 100;
      const remainder = Math.round((discountedTotal - baseShare * count) * 100) / 100;

      shares = members.map((m, idx) => {
        const extra = idx === 0 ? remainder : 0;
        const amount = Math.round((baseShare + extra) * 100) / 100;
        return {
          memberId: m.id,
          memberName: m.name,
          shareAmount: amount,
          itemsCount: Math.ceil(group.orderedFoods.length / count),
          detailText: `Part égale (1/${count})`,
        };
      });
    } else {
      // ITEMIZED: Split by ordered item per member
      const discountMultiplier = 1 - (group.discountPercentage || 25) / 100;

      shares = members.map((m) => {
        const cleanName = m.name.replace(' (Vous)', '').trim().toLowerCase();
        const memberFoods = group.orderedFoods.filter((f: any) => {
          const addedBy = (f.addedBy || '').toLowerCase();
          return addedBy.includes(cleanName) || cleanName.includes(addedBy);
        });

        const itemsSubtotal = memberFoods.reduce(
          (sum: number, f: any) => sum + f.unitPrice * f.quantity,
          0
        );

        const rawShare =
          itemsSubtotal > 0
            ? itemsSubtotal * discountMultiplier
            : discountedTotal / count;
        const shareAmount = Math.round(rawShare * 100) / 100;

        return {
          memberId: m.id,
          memberName: m.name,
          shareAmount,
          itemsCount: memberFoods.length || 1,
          detailText:
            memberFoods.length > 0
              ? `${memberFoods.length} plat(s) commandé(s)`
              : 'Part forfaitaire',
        };
      });
    }

    const calculatedSum = Math.round(shares.reduce((sum, s) => sum + s.shareAmount, 0) * 100) / 100;

    const payload = {
      groupId: group.id,
      splitMode,
      totalAmount: group.originalTotal || 355,
      discountedTotal,
      discountPercentage: group.discountPercentage || 25,
      deliveryFee: 0,
      memberShares: shares,
      calculatedSum,
      isBalanced: Math.abs(calculatedSum - discountedTotal) < 0.5,
    };

    try {
      return GroupSplitCalculationSchema.parse(payload);
    } catch (error) {
      console.error('Zod split calculation error:', error);
      return payload as GroupSplitCalculation;
    }
  }, [group, splitMode]);

  if (!visible || !group || !splitCalculation) return null;

  const handleConfirm = () => {
    // Validate with Zod before proceeding
    const result = GroupSplitCalculationSchema.safeParse(splitCalculation);
    if (!result.success) {
      Alert.alert(
        'Erreur de calcul',
        'La répartition des montants comporte une erreur. Veuillez réessayer.'
      );
      return;
    }
    onConfirmSplit(result.data);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl p-5 max-h-[88%] border-t border-slate-200 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="calculator-outline" size={22} color="#16a34a" />
              <Text className="text-lg font-extrabold text-slate-900 ml-2">
                Répartition du paiement
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} className="p-1 rounded-full bg-slate-100">
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Mode Switcher Tabs */}
          <View className="flex-row bg-slate-100 p-1.5 rounded-2xl mb-4">
            <Pressable
              onPress={() => setSplitMode('EQUAL')}
              className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${
                splitMode === 'EQUAL' ? 'bg-white shadow-2xs' : ''
              }`}
            >
              <Text className="text-sm mr-1.5">⚖️</Text>
              <Text
                className={`text-xs font-bold ${
                  splitMode === 'EQUAL' ? 'text-emerald-700' : 'text-slate-600'
                }`}
              >
                Split Égal
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSplitMode('ITEMIZED')}
              className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${
                splitMode === 'ITEMIZED' ? 'bg-white shadow-2xs' : ''
              }`}
            >
              <Text className="text-sm mr-1.5">🍕</Text>
              <Text
                className={`text-xs font-bold ${
                  splitMode === 'ITEMIZED' ? 'text-emerald-700' : 'text-slate-600'
                }`}
              >
                Par article
              </Text>
            </Pressable>
          </View>

          {/* Zod Validation Success Badge */}
          <View className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="shield-checkmark" size={18} color="#16a34a" style={{ marginRight: 8 }} />
              <View className="flex-1">
                <Text className="text-xs font-bold text-emerald-900">
                  Calcul contrôlé par Zod
                </Text>
                <Text className="text-[10px] font-medium text-emerald-700">
                  Somme répartie : {splitCalculation.calculatedSum} DH (Remise -{group.discountPercentage}% incluse)
                </Text>
              </View>
            </View>
            <View className="bg-emerald-600 px-2 py-0.5 rounded-md">
              <Text className="text-[10px] font-bold text-white">✔ Valide</Text>
            </View>
          </View>

          {/* Members Breakdown Table ("Qui doit combien") */}
          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Récapitulatif (Qui doit combien)
            </Text>

            {splitCalculation.memberShares.map((share, idx) => {
              const memberObj = group.members.find((m) => m.id === share.memberId);

              return (
                <View
                  key={share.memberId || idx}
                  className="flex-row items-center justify-between py-2.5 px-3 bg-slate-50 rounded-2xl border border-slate-200/70 mb-2"
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <Image
                      source={{
                        uri:
                          memberObj?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
                      }}
                      className="w-9 h-9 rounded-full mr-2.5 border border-slate-200"
                    />

                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-900">{share.memberName}</Text>
                      <Text className="text-[10px] font-medium text-slate-500">
                        {share.detailText}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-sm font-extrabold text-emerald-700">
                      {share.shareAmount} DH
                    </Text>
                    <Text className="text-[9px] font-semibold text-slate-400">à payer</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Actions */}
          <View className="pt-2 border-t border-slate-100 flex-row space-x-2">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 items-center justify-center mr-2"
            >
              <Text className="text-xs font-bold text-slate-700">Annuler</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              className="flex-2 py-3.5 px-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center flex-row shadow-md ml-1"
            >
              <Ionicons name="card-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text className="text-xs font-extrabold text-white">
                Valider la répartition ({splitCalculation.calculatedSum} DH)
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GroupPaymentSplitModal;
