import { Generator, generator, GeneratorOptions, timestamp } from 'ui7'

export const uuidv7: Generator = generator({
	time: () => Math.floor(Date.now() / 1000),
	entropy: 0xff,
	upper: true,
	dashes: true,
} as GeneratorOptions)

export function parse(uuidv7: string) {
	return timestamp(uuidv7)
}
