import { assert, expect, test } from 'vitest'
import { checkConnections, removeOldConnections } from '../app/verifier'

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

test('adds to old group on the right', () => {
  const result = checkConnections(['━━━━'], [{elements: ['0,2', '0,3'], color: '#000000'}])
  expect(result).toHaveLength(1)
  assert.propertyVal(result[0], 'color', '#000000')
  assert.deepPropertyVal(result[0], 'elements', ['0,0', '0,1', '0,2', '0,3'])
})

test('removes disconnected element', () => {
  const result = removeOldConnections(['┏━┛'], [{elements: ['0,0', '0,1', '0,2'], color: '#000000'}], 0, 2)
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({elements: ['0,1', '0,0'], color: '#000000'})
})

test('removes disconnected group', () => {
  const result = removeOldConnections(['┏┛'], [{elements: ['0,0', '0,1'], color: '#000000'}], 0, 1)
  expect(result).toHaveLength(0)
})

test('removes disconnected head', () => {
  const result = removeOldConnections(['╺━━┛'], [{elements: ['0,0', '0,1', '0,2', '0,3'], color: '#000000'}], 0, 1)
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({elements: ['0,2', '0,3'], color: '#000000'})
})

test('removes disconnected beginning', () => {
  const result = removeOldConnections(['┏━━┛'], [{elements: ['0,0', '0,1', '0,2', '0,3'], color: '#000000'}], 0, 1)
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({elements: ['0,2', '0,3'], color: '#000000'})
})

test.todo('generates a color', () => {
  expect(true).toBe(true)
})

test('gets group base', () => {
  const result = removeOldConnections(['┏┻┓'], [{elements: ['0,0', '0,1', '0,2'], color: '#000000'}], 0, 1)
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({elements: ['0,1', '0,2'], color: '#000000'})
})

test('adds new group base', () => {
  const result = removeOldConnections(['┏┛┓'], [{elements: ['0,0', '0,1'], color: '#000000'}], 0, 1)
  expect(result).toHaveLength(1)
  expect(result[0]).toEqual({elements: ['0,1', '0,2'], color: '#000000'})
})
