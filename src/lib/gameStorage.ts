interface Guess {
	pegs: (string | null)[];
	feedback: (string | null)[];
	isSubmitted: boolean;
}

interface PlayerInfo {
	codeMakerName: string;
	codeBreakerName: string;
}

interface GameState {
	secretCode: (string | null)[];
	currentRow: number;
	guesses: Guess[];
	gameStatus: "settingSecret" | "playing" | "won" | "lost";
	selectedColor: string | null;
	currentPlayer: "codemaker" | "codebreaker";
	players: PlayerInfo | null;
}

const GAME_STORAGE_KEY = "mastermind_game_state";
const PLAYERS_STORAGE_KEY = "mastermind_players";

export const saveGameState = (state: GameState): void => {
	try {
		const stateToSave = {
			...state,
			timestamp: new Date().toISOString(),
		};
		localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(stateToSave));
	} catch (error) {
		console.error("Failed to save game state:", error);
	}
};

export const loadGameState = (): GameState | null => {
	try {
		const saved = localStorage.getItem(GAME_STORAGE_KEY);
		if (!saved) return null;

		const parsed = JSON.parse(saved);
		// Remove timestamp before returning
		const { timestamp, ...gameState } = parsed;
		console.log("Game state loaded from:", timestamp);
		return gameState as GameState;
	} catch (error) {
		console.error("Failed to load game state:", error);
		return null;
	}
};

export const clearGameState = (): void => {
	try {
		localStorage.removeItem(GAME_STORAGE_KEY);
	} catch (error) {
		console.error("Failed to clear game state:", error);
	}
};

export const savePlayers = (players: PlayerInfo): void => {
	try {
		localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
	} catch (error) {
		console.error("Failed to save players:", error);
	}
};

export const loadPlayers = (): PlayerInfo | null => {
	try {
		const saved = localStorage.getItem(PLAYERS_STORAGE_KEY);
		if (!saved) return null;
		return JSON.parse(saved) as PlayerInfo;
	} catch (error) {
		console.error("Failed to load players:", error);
		return null;
	}
};

export const clearPlayers = (): void => {
	try {
		localStorage.removeItem(PLAYERS_STORAGE_KEY);
	} catch (error) {
		console.error("Failed to clear players:", error);
	}
};

export const hasStoredGame = (): boolean => {
	return localStorage.getItem(GAME_STORAGE_KEY) !== null;
};

export const hasStoredPlayers = (): boolean => {
	return localStorage.getItem(PLAYERS_STORAGE_KEY) !== null;
};
