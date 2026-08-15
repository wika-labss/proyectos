import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';
import { EngineState } from '../engine/snakeEngine';

type Props = {
  engine: EngineState;
  cellSize: number;
};

export function Board({ engine, cellSize }: Props) {
  const snakeKeys = new Set(engine.snake.map((c) => `${c.x},${c.y}`));
  const head = engine.snake[0];
  const headKey = head ? `${head.x},${head.y}` : '';

  const rows = [];
  for (let y = 0; y < engine.height; y += 1) {
    const cols = [];
    for (let x = 0; x < engine.width; x += 1) {
      const key = `${x},${y}`;
      const isFood = engine.food.x === x && engine.food.y === y;
      const isSnake = snakeKeys.has(key);
      const isHead = key === headKey;
      cols.push(
        <View
          key={key}
          style={[
            styles.cell,
            {
              width: cellSize,
              height: cellSize,
              backgroundColor: isFood
                ? colors.food
                : isHead
                  ? colors.head
                  : isSnake
                    ? colors.snake
                    : colors.grid,
            },
            isFood && styles.food,
          ]}
        />
      );
    }
    rows.push(
      <View key={`r${y}`} style={styles.row}>
        {cols}
      </View>
    );
  }

  return <View style={styles.board}>{rows}</View>;
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: colors.muted,
    backgroundColor: colors.arena,
    padding: 2,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    margin: 0.5,
    borderRadius: 2,
  },
  food: {
    borderRadius: cellFoodRadius(),
  },
});

function cellFoodRadius(): number {
  return 999;
}
