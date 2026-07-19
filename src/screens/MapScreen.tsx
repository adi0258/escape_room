import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InventoryBar from '../components/InventoryBar';
import Narrator from '../components/Narrator';
import { useGameStore } from '../store/useGameStore';
import { LOCATIONS, LocationId, narrator2Line } from '../data/story';
import { SKINS } from '../data/skins';
import { colors } from '../theme/theme';
import { sound } from '../fx/sound';
import { IMG } from '../data/images';

const ORDER: LocationId[] = ['lobby', 'hallway', 'boardCorner', 'office', 'stairs', 'cellar', 'clockRoom'];

/**
 * Hand-drawn-blueprint style school map. The player freely picks where to
 * walk; only rooms connected to the current one are reachable, and the
 * clock room stays hidden until discovered.
 */
export default function MapScreen() {
  const { location, playerName, skinId, travelTo, narrate, hasFlag, visited } =
    useGameStore();
  const skin = SKINS.find(s => s.id === skinId);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    narrate(narrator2Line('mapIntro', playerName));
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canReach = (loc: LocationId) =>
    loc === location || LOCATIONS[location].connections.includes(loc);

  const pick = (loc: LocationId) => {
    if (loc === location) return;
    if (!canReach(loc)) {
      sound.error();
      narrate(narrator2Line('travelBlocked', playerName));
      return;
    }
    sound.footsteps();
    narrate(narrator2Line('travel', playerName, LOCATIONS[loc].name));
    travelTo(loc);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <InventoryBar />
      <View style={styles.paper}>
        <Image source={IMG.map} style={styles.mapBg} resizeMode="cover" />
        <View style={styles.mapTint} />
        <Text style={styles.title}>מפת בית הספר</Text>
        <Text style={styles.subtitle}>"לא בקנה מידה. בכלל." — הקריין</Text>

        {/* floor separator */}
        <View style={styles.floorLine} />
        <Text style={styles.floorLabel}>קומת מרתף ↑</Text>

        {/* corridors */}
        {ORDER.map(id =>
          LOCATIONS[id].connections.map(other =>
            ORDER.indexOf(other) > ORDER.indexOf(id) ? (
              <View
                key={`${id}-${other}`}
                style={[
                  styles.corridor,
                  corridorStyle(
                    LOCATIONS[id].mapX,
                    LOCATIONS[id].mapY,
                    LOCATIONS[other].mapX,
                    LOCATIONS[other].mapY,
                  ),
                ]}
              />
            ) : null,
          ),
        )}

        {ORDER.map(id => {
          const def = LOCATIONS[id];
          const here = id === location;
          const hidden = id === 'clockRoom' && !hasFlag('clockRoomUnlocked');
          if (hidden) return null;
          const reachable = canReach(id);
          return (
            <Pressable
              key={id}
              onPress={() => pick(id)}
              style={[
                styles.room,
                { left: `${def.mapX}%`, top: `${def.mapY}%` },
                here && styles.roomHere,
                !reachable && styles.roomFar,
              ]}>
              <Text style={styles.roomName}>{def.name}</Text>
              {visited[id] && !here && <Text style={styles.roomMark}>✓</Text>}
              {here && (
                <Animated.View
                  style={[styles.playerMark, { transform: [{ scale: pulse }] }]}>
                  <Text style={styles.playerInitial}>{skin?.initial ?? '?'}</Text>
                </Animated.View>
              )}
            </Pressable>
          );
        })}

        <Text style={styles.legend}>
          לחצו על חדר מחובר כדי ללכת אליו • העיגול המוזהב = אתם
        </Text>
      </View>
      <Narrator />
    </SafeAreaView>
  );
}

/** thin dashed line between two room centers (simple axis-aligned corridors) */
function corridorStyle(x1: number, y1: number, x2: number, y2: number) {
  const horizontal = Math.abs(x1 - x2) > Math.abs(y1 - y2);
  if (horizontal) {
    return {
      left: `${Math.min(x1, x2) + 4}%`,
      top: `${(y1 + y2) / 2 + 3}%`,
      width: `${Math.abs(x1 - x2) - 8}%`,
      height: 0,
      borderTopWidth: 2,
    } as const;
  }
  return {
    left: `${(x1 + x2) / 2 + 6}%`,
    top: `${Math.min(y1, y2) + 6}%`,
    width: 0,
    height: `${Math.abs(y1 - y2) - 8}%`,
    borderLeftWidth: 2,
  } as const;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDarkest },
  paper: {
    flex: 1,
    margin: 14,
    borderRadius: 16,
    backgroundColor: '#1a140c',
    borderWidth: 2,
    borderColor: 'rgba(120,95,60,0.6)',
    overflow: 'hidden',
  },
  mapBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  mapTint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20,12,4,0.35)',
  },
  title: {
    color: '#f4e8c8',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
    writingDirection: 'rtl',
  },
  subtitle: {
    color: 'rgba(244,232,200,0.75)',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 6,
    writingDirection: 'rtl',
  },
  floorLine: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    top: '38%',
    borderTopWidth: 2,
    borderColor: 'rgba(90,63,34,0.55)',
    borderStyle: 'dashed',
  },
  floorLabel: {
    position: 'absolute',
    right: '6%',
    top: '33%',
    color: 'rgba(244,232,200,0.7)',
    fontSize: 11,
    writingDirection: 'rtl',
  },
  corridor: {
    position: 'absolute',
    borderColor: 'rgba(70,48,25,0.65)',
    borderStyle: 'dashed',
  },
  room: {
    position: 'absolute',
    width: 112,
    marginLeft: -56,
    minHeight: 50,
    borderWidth: 2,
    borderColor: '#5a3f22',
    borderRadius: 6,
    backgroundColor: 'rgba(40,28,14,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  roomHere: {
    borderColor: colors.accentGold,
    shadowColor: colors.accentGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  roomFar: { opacity: 0.45 },
  roomName: {
    color: '#f4e8c8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  roomMark: { position: 'absolute', top: 2, left: 6, color: colors.accentGreen, fontWeight: '900' },
  playerMark: {
    position: 'absolute',
    top: -26,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a1e10',
    borderWidth: 2,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitial: { color: colors.accentGold, fontWeight: '800', fontSize: 15 },
  legend: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    color: 'rgba(244,232,200,0.8)',
    fontSize: 12,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
