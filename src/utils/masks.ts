// Utilitários para máscaras de formatação

// Máscara para telefone fixo: (11) 1234-5678
export const applyPhoneMask = (value: string): string => {
	// Remove tudo que não é número
	const numbers = value.replace(/\D/g, '')
	
	// Aplica a máscara (11) 1234-5678
	if (numbers.length <= 2) {
		return numbers
	} else if (numbers.length <= 6) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
	} else if (numbers.length <= 10) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
	} else {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`
	}
}

// Máscara para telefone celular: (11) 98765-4321
export const applyMobileMask = (value: string): string => {
	// Remove tudo que não é número
	const numbers = value.replace(/\D/g, '')
	
	// Aplica a máscara (11) 98765-4321
	if (numbers.length <= 2) {
		return numbers
	} else if (numbers.length <= 7) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
	} else if (numbers.length <= 11) {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
	} else {
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
	}
}

// Máscara para horário: HH:MM
export const applyTimeMask = (value: string): string => {
	// Remove tudo que não é número
	const numbers = value.replace(/\D/g, '')
	
	// Aplica a máscara HH:MM
	if (numbers.length <= 2) {
		return numbers
	} else if (numbers.length <= 4) {
		return `${numbers.slice(0, 2)}:${numbers.slice(2)}`
	} else {
		return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`
	}
}

// Função para extrair apenas números (para enviar ao backend)
export const extractNumbers = (value: string): string => {
	return value.replace(/\D/g, '')
}
