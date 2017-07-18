This directory exists for defining typescript interfaces to 3rd party modules which DO NOT otherwise supply type definitions.

Remember, many many 3rd party packages supply their own type definitions.  The typescript compiler will search for type definitions as follows:

1. If the npm module being imported specifies a "typing" property in package.json, that will be used
2. A 3rd-party mainted typescript interface may be distributed on DefinitelyTyped: http://definitelytyped.org.  If it is it can be installed with npm install @types/modulename.

Example:

`npm install @types/bluebird` 

will create the directory node_modules/@types/bluebird -- typescript compiler will use interface definitions from here to resolve types of bluebird module.

3. We added the directory @Custom3rdPartyTypes to out project.  Typescript compiler will find modules declared herein

Example:

The npm module 'us-state-codes' does not provide a type declaration and there is not (currently) a maintained type declaration in DefinitelyTyped.  Therefore we create the file: @Custom3rdPartyTypes/us-state-codes/index.d.ts

Typescript will use the module declarations in the above index.d.ts -- it includes the line 

`declare module 'us-state-codes'`

Which causes typescript compiler to use above declarations for the 'us-state-code' module (eg, when you require('us-state-codes') or import 'us-state-codes')

