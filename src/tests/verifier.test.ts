import { assert, expect, test } from 'vitest'
import { checkConnections } from '../app/verifier'

test('return no groups', () => {
  const result = checkConnections(['╻'], [])
  expect(result).toHaveLength(0)
})

test('return one group', () => {
  const result = checkConnections(['╺╸'], [])
  expect(result).toHaveLength(1)
  expect(result[0].elements).toEqual(['0,0', '0,1'])
})

test('return two separate groups', () => {
  const result = checkConnections(['╺╸', '╺╸'], [])
  expect(result).toHaveLength(2)
  expect(result[0].elements).toEqual(['0,0', '0,1'])
  expect(result[1].elements).toEqual(['1,0', '1,1'])
})

test('return no groups for unconnected symbols', () => {
  const result = checkConnections(['╻╺'], [])
  expect(result).toHaveLength(0)
})

test('return one group for complex connection', () => {
  const result = checkConnections(['┏━┓', '┃╋┃', '┗━┛'], [])
  expect(result).toHaveLength(1)
  expect(result[0].elements).toEqual(['0,0', '0,1', '1,0', '0,2', '1,2', '2,0', '2,2', '2,1'])
})

test('adds element to group', () => {
  const result = checkConnections(['┏━┓'], [{elements: ['0,0', '0,1'], color: '#000000'}])
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({elements: ['0,0', '0,1', '0,2'], color: '#000000'})
})

test('adds more groups', () => {
  const result = checkConnections(['┏━','┏━'], [{elements: ['0,0', '0,1'], color: '#000000'}])
  expect(result).toHaveLength(2)
  expect(result[0]).toEqual({elements: ['0,0', '0,1'], color: '#000000'})
  assert.property(result[1], 'color')
  assert.deepPropertyVal(result[1], 'elements', ['1,0', '1,1'])
})

test.skip('removes disconnected element', () => {
  const result = checkConnections(['┏━┗'], [{elements: ['0,0', '0,1', '0,2'], color: '#000000'}])
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({elements: ['0,0', '0,1'], color: '#000000'})
})

test.skip('removes disconnected group', () => {
  const result = checkConnections(['┏┗'], [{elements: ['0,0', '0,1'], color: '#000000'}])
  expect(result).toHaveLength(0)
})
